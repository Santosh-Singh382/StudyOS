import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  createStudySession,
  getStudySession,
  pauseStudySession,
  resumeStudySession,
  completeStudySession,
  cancelStudySession,
} from '../services/studySessions';

const TIMER_STORAGE_KEY = 'studyos_timer';
const POMODORO_CONFIG_KEY = 'studyos_pomodoro_config';

export const POMODORO_DEFAULTS = {
  focusSeconds: 25 * 60,
  shortBreakSeconds: 5 * 60,
  longBreakSeconds: 15 * 60,
  cyclesBeforeLongBreak: 4,
};

export const POMODORO_PHASES = {
  focus: { label: 'Focus', mode: 'POMODORO_FOCUS' },
  short: { label: 'Short break', mode: 'POMODORO_SHORT_BREAK' },
  long: { label: 'Long break', mode: 'POMODORO_LONG_BREAK' },
};

function emptyActive() {
  return {
    id: null,
    status: null,
    mode: null,
    subject: null,
    topic: null,
    task: null,
    activeStartedAt: null,
    accumulatedSeconds: 0,
    pomodoro: { phase: 'focus', focusCycles: 0 },
  };
}

function phaseFromMode(mode) {
  if (mode === 'POMODORO_SHORT_BREAK') return 'short';
  if (mode === 'POMODORO_LONG_BREAK') return 'long';
  return 'focus';
}

function readPomodoroConfig() {
  try {
    const raw = localStorage.getItem(POMODORO_CONFIG_KEY);
    if (!raw) return POMODORO_DEFAULTS;
    const parsed = JSON.parse(raw);
    const num = (value, fallback) =>
      Number.isFinite(value) && value > 0 ? Math.round(value) : fallback;
    return {
      focusSeconds: num(parsed.focusSeconds, POMODORO_DEFAULTS.focusSeconds),
      shortBreakSeconds: num(parsed.shortBreakSeconds, POMODORO_DEFAULTS.shortBreakSeconds),
      longBreakSeconds: num(parsed.longBreakSeconds, POMODORO_DEFAULTS.longBreakSeconds),
      cyclesBeforeLongBreak: num(parsed.cyclesBeforeLongBreak, POMODORO_DEFAULTS.cyclesBeforeLongBreak),
    };
  } catch {
    return POMODORO_DEFAULTS;
  }
}

function readStoredTimer() {
  try {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.active && typeof parsed.active?.id !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredTimer(timer) {
  try {
    const payload = {
      v: 1,
      mode: timer.mode,
      selection: timer.selection,
      active: timer.active
        ? {
            id: timer.active.id,
            status: timer.active.status,
            mode: timer.active.mode,
            activeStartedAt: timer.active.activeStartedAt,
            accumulatedSeconds: timer.active.accumulatedSeconds,
            pomodoro: timer.active.pomodoro,
          }
        : null,
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // storage unavailable/corrupt — timer still works for the session
  }
}

const TimerContext = createContext(undefined);

export function TimerProvider({ children }) {
  const configRef = useRef(readPomodoroConfig());
  const [timer, setTimer] = useState(() => ({
    mode: 'STUDY',
    selection: { subject: null, topic: null, task: null },
    active: null,
  }));
  const timerRef = useRef(timer);
  const [now, setNow] = useState(() => Date.now());
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const busyRef = useRef(false);
  const cancelNoticeTimer = useRef(null);

  const updateTimer = useCallback((updater) => {
    setTimer((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      timerRef.current = next;
      return next;
    });
  }, []);

  const showNotice = useCallback((message) => {
    setNotice(message);
    if (cancelNoticeTimer.current) clearTimeout(cancelNoticeTimer.current);
    cancelNoticeTimer.current = setTimeout(() => setNotice(null), 7000);
  }, []);

  // Never persist until hydration is complete — otherwise the mount-time write
  // would clobber the stored timer before the restore effect reads it.
  useEffect(() => {
    if (!hydrated) return;
    writeStoredTimer(timer);
  }, [timer, hydrated]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  // Refresh persistence: reconcile a stored timer with the server once on mount.
  // Never creates a new session — only re-adopts the one that already exists.
  useEffect(() => {
    let cancelled = false;

    const stored = readStoredTimer();
    if (!stored) {
      setHydrated(true);
      return;
    }
    if (stored.mode) {
      updateTimer((t) => ({ ...t, mode: stored.mode }));
    }

    if (!stored.active) {
      setHydrated(true);
      return;
    }

const st = stored.active;
    const reconcile = async () => {
      try {
        const res = await getStudySession(st.id);
        if (cancelled) return;
        const session = res.session;
        if (session.status === 'RUNNING' || session.status === 'PAUSED') {
          const liveMs = session.liveSeconds ? session.liveSeconds * 1000 : 0;
          const restoredActive = {
            id: session.id,
            status: session.status,
            mode: session.mode,
            subject: session.subject || st.subject || null,
            topic: session.topic || st.topic || null,
            task: session.task || st.task || null,
            activeStartedAt:
              session.status === 'RUNNING'
                ? st.activeStartedAt ?? (Date.now() - liveMs)
                : null,
            accumulatedSeconds: session.durationSeconds || 0,
            pomodoro: st.pomodoro || {
              phase: phaseFromMode(session.mode),
              focusCycles: 0,
            },
          };
          updateTimer((t) => ({
            ...t,
            selection: {
              subject: restoredActive.subject,
              topic: restoredActive.topic,
              task: restoredActive.task,
            },
            active: restoredActive,
          }));
        } else {
          updateTimer((t) => ({ ...t, active: null }));
          showNotice('A previous timer session was already finished. Active timer cleared.');
        }
      } catch (err) {
        if (cancelled) return;
        if (err.status === 404) {
          updateTimer((t) => ({ ...t, active: null }));
          showNotice('The previous session no longer exists. Active timer cleared.');
        } else {
          const liveMs = st.activeStartedAt ? 0 : 0;
          updateTimer((t) => ({
            ...t,
            active: {
              id: st.id,
              status: st.status,
              mode: st.mode,
              subject: st.subject || null,
              topic: st.topic || null,
              task: st.task || null,
              activeStartedAt: st.status === 'RUNNING' ? st.activeStartedAt ?? (Date.now() - liveMs) : null,
              accumulatedSeconds: st.accumulatedSeconds || 0,
              pomodoro: st.pomodoro || { phase: phaseFromMode(st.mode), focusCycles: 0 },
            },
          }));
          showNotice('Could not verify the running session. Showing local time — the next action will reconcile with the server.');
        }
      } finally {
        setHydrated(true);
      }
    };

    reconcile();
    return () => {
      cancelled = true;
    };

    reconcile();
    return () => {
      cancelled = true;
    };
  }, [updateTimer, showNotice]);

  useEffect(() => {
    setHistoryVersion((v) => v + 1);
  }, [timer.active?.id, timer.active?.status]);

  const elapsedSeconds = useMemo(() => {
    const a = timer.active;
    if (!a) return 0;
    let base = Number(a.accumulatedSeconds) || 0;
    if (a.status === 'RUNNING' && a.activeStartedAt) {
      const ms = now - a.activeStartedAt;
      if (ms > 0) base += Math.floor(ms / 1000);
    }
    return base;
  }, [timer.active, now]);

  const activeIsPomodoro = Boolean(
    timer.active &&
      (timer.active.mode === 'POMODORO_FOCUS' ||
        timer.active.mode === 'POMODORO_SHORT_BREAK' ||
        timer.active.mode === 'POMODORO_LONG_BREAK')
  );

  const phaseSeconds = useMemo(() => {
    const a = timer.active;
    if (!a) return null;
    const cfg = configRef.current;
    if (a.mode === 'POMODORO_FOCUS') return cfg.focusSeconds;
    if (a.mode === 'POMODORO_SHORT_BREAK') return cfg.shortBreakSeconds;
    if (a.mode === 'POMODORO_LONG_BREAK') return cfg.longBreakSeconds;
    return null;
  }, [timer.active]);

  const remainingSeconds = useMemo(() => {
    if (!phaseSeconds || phaseSeconds == null) return null;
    return Math.max(0, phaseSeconds - elapsedSeconds);
  }, [phaseSeconds, elapsedSeconds]);

  const start = useCallback(async () => {
    if (busyRef.current) return;
    const t = timerRef.current;
    const a = t.active;
    if (a && (a.status === 'RUNNING' || a.status === 'PAUSED')) {
      showNotice('A session is already running. Stop or cancel it first.');
      return;
    }
    if (!t.selection.subject) {
      showNotice('Select a subject first.');
      return;
    }

    busyRef.current = true;
    setBusy(true);
    try {
      const sessionMode =
        t.mode === 'POMODORO' ? 'POMODORO_FOCUS' : 'STUDY';
      const res = await createStudySession({
        subject: t.selection.subject ? t.selection.subject.id : null,
        topic: t.selection.topic ? t.selection.topic.id : null,
        task: t.selection.task ? t.selection.task.id : null,
        mode: sessionMode,
      });
      const s = res.session;
      updateTimer((prev) => ({
        ...prev,
        active: {
          id: s.id,
          status: 'RUNNING',
          mode: sessionMode,
          subject: s.subject,
          topic: s.topic,
          task: s.task,
          activeStartedAt: Date.now(),
          accumulatedSeconds: 0,
          pomodoro:
            sessionMode === 'POMODORO_FOCUS'
              ? { phase: 'focus', focusCycles: 0 }
              : prev.active?.pomodoro || { phase: 'focus', focusCycles: 0 },
        },
      }));
      showNotice(
        sessionMode === 'STUDY'
          ? 'Session started. Focus time!'
          : 'Pomodoro started. Focus time!'
      );
    } catch (err) {
      showNotice(err.message);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [showNotice, updateTimer]);

  const pause = useCallback(async () => {
    const a = timerRef.current.active;
    if (!a || a.status !== 'RUNNING') {
      showNotice('There is no running session to pause.');
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      const res = await pauseStudySession(a.id);
      updateTimer((prev) => ({
        ...prev,
        active: prev.active
          ? {
              ...prev.active,
              status: 'PAUSED',
              activeStartedAt: null,
              accumulatedSeconds: res.session.durationSeconds || 0,
            }
          : prev.active,
      }));
    } catch (err) {
      showNotice(err.message);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [showNotice, updateTimer]);

  const resume = useCallback(async () => {
    const a = timerRef.current.active;
    if (!a || a.status !== 'PAUSED') {
      showNotice('There is no paused session to resume.');
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      const res = await resumeStudySession(a.id);
      updateTimer((prev) => ({
        ...prev,
        active: prev.active
          ? {
              ...prev.active,
              status: 'RUNNING',
              activeStartedAt: Date.now(),
              accumulatedSeconds: res.session.durationSeconds || 0,
            }
          : prev.active,
      }));
    } catch (err) {
      showNotice(err.message);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [showNotice, updateTimer]);

  const clearActive = useCallback(() => {
    updateTimer((prev) => ({ ...prev, active: null }));
  }, [updateTimer]);

  const stop = useCallback(async () => {
    const a = timerRef.current.active;
    if (!a) {
      showNotice('No active session to stop.');
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      await completeStudySession(a.id);
      updateTimer((prev) => ({ ...prev, active: null }));
      showNotice('Session completed and saved.');
    } catch (err) {
      if (err.status === 409) {
        updateTimer((prev) => ({ ...prev, active: null }));
        showNotice('That session was already finished.');
      } else {
        showNotice(err.message);
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [showNotice, updateTimer]);

  const cancel = useCallback(async () => {
    const a = timerRef.current.active;
    if (!a) {
      showNotice('No active session to cancel.');
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      await cancelStudySession(a.id);
      updateTimer((prev) => ({ ...prev, active: null }));
      showNotice('Session cancelled. No study time was recorded.');
    } catch (err) {
      if (err.status === 409) {
        updateTimer((prev) => ({ ...prev, active: null }));
        showNotice('That session was already finished.');
      } else {
        showNotice(err.message);
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [showNotice, updateTimer]);

  // Auto-advance pomodoro phases from the running session's timestamps.
  const advance = useCallback(async () => {
    const t = timerRef.current;
    const a = t.active;
    if (!a || a.status !== 'RUNNING') return;
    if (a.mode !== 'POMODORO_FOCUS' &&
        a.mode !== 'POMODORO_SHORT_BREAK' &&
        a.mode !== 'POMODORO_LONG_BREAK') {
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      if (a.mode === 'POMODORO_FOCUS') {
        await completeStudySession(a.id);
        const nextCycles = (a.pomodoro.focusCycles || 0) + 1;
        const cfg = configRef.current;
        const phase =
          nextCycles % cfg.cyclesBeforeLongBreak === 0 ? 'long' : 'short';
        const breakMode =
          phase === 'long' ? 'POMODORO_LONG_BREAK' : 'POMODORO_SHORT_BREAK';
        const res = await createStudySession({
          subject: a.subject ? a.subject.id : null,
          topic: a.topic ? a.topic.id : null,
          task: a.task ? a.task.id : null,
          mode: breakMode,
        });
        const s = res.session;
        updateTimer((prev) => ({
          ...prev,
          active: {
            id: s.id,
            status: 'RUNNING',
            mode: breakMode,
            subject: s.subject,
            topic: s.topic,
            task: s.task,
            activeStartedAt: Date.now(),
            accumulatedSeconds: 0,
            pomodoro: { phase, focusCycles: nextCycles },
          },
        }));
        showNotice(
          phase === 'long'
            ? 'Focus complete! Starting a long break.'
            : 'Focus complete! Starting a short break.'
        );
      } else {
        await completeStudySession(a.id);
        const res = await createStudySession({
          subject: a.subject ? a.subject.id : null,
          topic: a.topic ? a.topic.id : null,
          task: a.task ? a.task.id : null,
          mode: 'POMODORO_FOCUS',
        });
        const s = res.session;
        updateTimer((prev) => ({
          ...prev,
          active: {
            id: s.id,
            status: 'RUNNING',
            mode: 'POMODORO_FOCUS',
            subject: s.subject,
            topic: s.topic,
            task: s.task,
            activeStartedAt: Date.now(),
            accumulatedSeconds: 0,
            pomodoro: {
              phase: 'focus',
              focusCycles: prev.active?.pomodoro?.focusCycles || 0,
            },
          },
        }));
        showNotice('Break over — back to focus.');
      }
    } catch (err) {
      showNotice(err.message);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [showNotice, updateTimer]);

  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  useEffect(() => {
    const a = timer.active;
    if (!a || a.status !== 'RUNNING') return;
    const isPomodoro =
      a.mode === 'POMODORO_FOCUS' ||
      a.mode === 'POMODORO_SHORT_BREAK' ||
      a.mode === 'POMODORO_LONG_BREAK';
    if (!isPomodoro) return;

    const cfg = configRef.current;
    let phaseSec = 0;
    if (a.mode === 'POMODORO_FOCUS') phaseSec = cfg.focusSeconds;
    else if (a.mode === 'POMODORO_SHORT_BREAK') phaseSec = cfg.shortBreakSeconds;
    else if (a.mode === 'POMODORO_LONG_BREAK') phaseSec = cfg.longBreakSeconds;

    if (phaseSec <= 0) return;
    const remaining = a.activeStartedAt
      ? Math.ceil((a.activeStartedAt + phaseSec * 1000 - now) / 1000)
      : phaseSec;

    if (remaining <= 0 && !busyRef.current) {
      advanceRef.current();
    }
  }, [now, timer.active]);

  const setMode = useCallback(
    (mode) => {
      if (mode !== 'STUDY' && mode !== 'POMODORO') return;
      updateTimer((prev) => ({ ...prev, mode }));
    },
    [updateTimer]
  );

  const setSubject = useCallback(
    (subject) => {
      updateTimer((prev) => ({
        ...prev,
        selection: {
          subject,
          topic: null,
          task: null,
        },
      }));
    },
    [updateTimer]
  );

  const setTopic = useCallback(
    (topic) => {
      updateTimer((prev) => ({
        ...prev,
        selection: { ...prev.selection, topic },
      }));
    },
    [updateTimer]
  );

  const setTask = useCallback(
    (task) => {
      updateTimer((prev) => ({
        ...prev,
        selection: { ...prev.selection, task },
      }));
    },
    [updateTimer]
  );

  useEffect(() => {
    return () => {
      if (cancelNoticeTimer.current) clearTimeout(cancelNoticeTimer.current);
    };
  }, []);

  const value = {
    mode: timer.mode,
    selection: timer.selection,
    active: timer.active,
    isActive: Boolean(timer.active),
    activeStatus: timer.active?.status ?? null,
    elapsedSeconds,
    remainingSeconds,
    activeIsPomodoro,
    phaseSeconds,
    notice,
    busy,
    historyVersion,
    config: configRef.current,
    start,
    pause,
    resume,
    stop,
    cancel,
    clearActive,
    setMode,
    setSubject,
    setTopic,
    setTask,
    showNotice,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}