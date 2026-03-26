'use strict';

// Manual Jest mock for src/services/storeService.js
// Replaces all file-system I/O so tests never write to data/.

const getStore = jest.fn(() => ({
  licenses: [],
  request_log: [],
  remote_content: [],
  tickets: [],
  _nextId: 1,
}));

const saveStore               = jest.fn();
const nextId                  = jest.fn(() => 1);
const ensureRedisInitialized  = jest.fn().mockResolvedValue(undefined);
const loadStore               = jest.fn();

module.exports = { getStore, saveStore, nextId, ensureRedisInitialized, loadStore };
