import { useState, useCallback } from 'react';
import { getHistory, addHistory, deleteHistory } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

export function useHistory() {
  const [history, setHistory] = useState(() => getHistory());

  const reload = useCallback(() => {
    setHistory(getHistory());
  }, []);

  const add = useCallback(({ tsuboId, tsuboName, bodyArea, durationSec, memo = '' }) => {
    const entry = {
      id: uuidv4(),
      tsuboId,
      tsuboName,
      bodyArea,
      startedAt: Date.now(),
      durationSec,
      memo,
    };
    addHistory(entry);
    setHistory(getHistory());
    return entry;
  }, []);

  const remove = useCallback((id) => {
    deleteHistory(id);
    setHistory(getHistory());
  }, []);

  return { history, add, remove, reload };
}
