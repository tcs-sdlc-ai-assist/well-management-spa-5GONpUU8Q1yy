import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getAllWells,
  getWellById,
  createWell,
  updateWell,
  activateWell,
  deleteWell,
  seedMockDataIfEmpty,
  resetToMockData,
  WellStorageError,
} from './wellStorageService.js';
import { STORAGE_KEY, WELL_STATUS } from '../constants.js';
import mockWells from '../data/mockData.js';

describe('wellStorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('seedMockDataIfEmpty', () => {
    it('seeds mock data when localStorage is empty', () => {
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
      seedMockDataIfEmpty();
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(Array.isArray(stored)).toBe(true);
      expect(stored.length).toBe(mockWells.length);
    });

    it('does not overwrite existing data when localStorage has wells', () => {
      const existingWells = [
        {
          id: 'test-id-1',
          name: 'Existing Well',
          status: WELL_STATUS.CREATED,
          type: 'Horizontal',
          location: 'Test Location',
          owner: 'Test Owner',
          operator: 'Test Operator',
          contractor: 'Test Contractor',
          rig: 'TEST-01',
          spudDate: '2024-01-01',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingWells));
      seedMockDataIfEmpty();
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored.length).toBe(1);
      expect(stored[0].name).toBe('Existing Well');
    });

    it('seeds data when localStorage has an empty array', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      seedMockDataIfEmpty();
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored.length).toBe(mockWells.length);
    });
  });

  describe('getAllWells', () => {
    it('returns seeded data when localStorage is empty', () => {
      const wells = getAllWells();
      expect(Array.isArray(wells)).toBe(true);
      expect(wells.length).toBe(mockWells.length);
    });

    it('returns wells from localStorage', () => {
      seedMockDataIfEmpty();
      const wells = getAllWells();
      expect(wells.length).toBe(mockWells.length);
      expect(wells[0]).toHaveProperty('id');
      expect(wells[0]).toHaveProperty('name');
      expect(wells[0]).toHaveProperty('status');
    });

    it('handles corrupted localStorage gracefully by reseeding', () => {
      localStorage.setItem(STORAGE_KEY, 'not valid json{{{');
      const wells = getAllWells();
      expect(Array.isArray(wells)).toBe(true);
      expect(wells.length).toBe(mockWells.length);
    });

    it('handles non-array JSON in localStorage gracefully', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }));
      const wells = getAllWells();
      expect(Array.isArray(wells)).toBe(true);
      expect(wells.length).toBe(mockWells.length);
    });
  });

  describe('getWellById', () => {
    it('returns the correct well by ID', () => {
      seedMockDataIfEmpty();
      const allWells = getAllWells();
      const targetWell = allWells[0];
      const found = getWellById(targetWell.id);
      expect(found).not.toBeNull();
      expect(found.id).toBe(targetWell.id);
      expect(found.name).toBe(targetWell.name);
    });

    it('returns null for a non-existent ID', () => {
      seedMockDataIfEmpty();
      const found = getWellById('non-existent-id-12345');
      expect(found).toBeNull();
    });

    it('returns null when localStorage is empty and ID does not match mock data', () => {
      const found = getWellById('definitely-not-a-real-id');
      expect(found).toBeNull();
    });
  });

  describe('createWell', () => {
    it('creates a new well and adds it to localStorage', () => {
      seedMockDataIfEmpty();
      const initialCount = getAllWells().length;

      const newWell = createWell({
        name: 'Brand New Well',
        type: 'Horizontal',
        location: 'Test Basin, TX',
        owner: 'Test Corp',
        operator: 'Test Corp',
        contractor: 'Test Drilling',
        rig: 'NEW-01',
        spudDate: '2024-06-01',
      });

      expect(newWell).toHaveProperty('id');
      expect(newWell).toHaveProperty('createdAt');
      expect(newWell.name).toBe('Brand New Well');
      expect(newWell.status).toBe(WELL_STATUS.CREATED);

      const allWells = getAllWells();
      expect(allWells.length).toBe(initialCount + 1);

      const found = getWellById(newWell.id);
      expect(found).not.toBeNull();
      expect(found.name).toBe('Brand New Well');
    });

    it('creates a well with a specified status', () => {
      seedMockDataIfEmpty();

      const newWell = createWell({
        name: 'Active New Well',
        type: 'Vertical',
        location: 'Test Location',
        owner: 'Owner',
        operator: 'Operator',
        contractor: 'Contractor',
        rig: 'RIG-99',
        spudDate: '2024-07-01',
        status: WELL_STATUS.ACTIVE,
      });

      expect(newWell.status).toBe(WELL_STATUS.ACTIVE);
    });

    it('throws WellStorageError when required field is missing', () => {
      seedMockDataIfEmpty();

      expect(() => {
        createWell({
          name: '',
          type: 'Horizontal',
          location: 'Test',
          owner: 'Owner',
          operator: 'Operator',
          contractor: 'Contractor',
          rig: 'RIG-01',
          spudDate: '2024-01-01',
        });
      }).toThrow();
    });

    it('throws WellStorageError for duplicate well name', () => {
      seedMockDataIfEmpty();
      const allWells = getAllWells();
      const existingName = allWells[0].name;

      expect(() => {
        createWell({
          name: existingName,
          type: 'Horizontal',
          location: 'Test',
          owner: 'Owner',
          operator: 'Operator',
          contractor: 'Contractor',
          rig: 'RIG-DUP',
          spudDate: '2024-01-01',
        });
      }).toThrow();
    });

    it('throws WellStorageError for invalid spudDate', () => {
      seedMockDataIfEmpty();

      expect(() => {
        createWell({
          name: 'Invalid Date Well',
          type: 'Horizontal',
          location: 'Test',
          owner: 'Owner',
          operator: 'Operator',
          contractor: 'Contractor',
          rig: 'RIG-DATE',
          spudDate: 'not-a-date',
        });
      }).toThrow();
    });

    it('trims string fields on creation', () => {
      seedMockDataIfEmpty();

      const newWell = createWell({
        name: '  Trimmed Well  ',
        type: '  Horizontal  ',
        location: '  Test Location  ',
        owner: '  Owner  ',
        operator: '  Operator  ',
        contractor: '  Contractor  ',
        rig: '  RIG-TRIM  ',
        spudDate: '2024-08-01',
      });

      expect(newWell.name).toBe('Trimmed Well');
      expect(newWell.type).toBe('Horizontal');
      expect(newWell.rig).toBe('RIG-TRIM');
    });
  });

  describe('updateWell', () => {
    it('updates well fields correctly', () => {
      seedMockDataIfEmpty();
      const allWells = getAllWells();
      const target = allWells[0];

      const updated = updateWell(target.id, {
        name: 'Updated Well Name',
        operator: 'New Operator',
      });

      expect(updated.name).toBe('Updated Well Name');
      expect(updated.operator).toBe('New Operator');
      expect(updated.id).toBe(target.id);

      const fetched = getWellById(target.id);
      expect(fetched.name).toBe('Updated Well Name');
      expect(fetched.operator).toBe('New Operator');
    });

    it('preserves unchanged fields during update', () => {
      seedMockDataIfEmpty();
      const allWells = getAllWells();
      const target = allWells[0];
      const originalRig = target.rig;
      const originalContractor = target.contractor;

      updateWell(target.id, { name: 'Partial Update Well' });

      const fetched = getWellById(target.id);
      expect(fetched.name).toBe('Partial Update Well');
      expect(fetched.rig).toBe(originalRig);
      expect(fetched.contractor).toBe(originalContractor);
    });

    it('throws WellStorageError when well ID is not found', () => {
      seedMockDataIfEmpty();

      expect(() => {
        updateWell('non-existent-id', { name: 'Does Not Exist' });
      }).toThrow();
    });

    it('throws WellStorageError for invalid status on update', () => {
      seedMockDataIfEmpty();
      const allWells = getAllWells();
      const target = allWells[0];

      expect(() => {
        updateWell(target.id, { status: 'invalid-status' });
      }).toThrow();
    });

    it('throws WellStorageError for duplicate name on update', () => {
      seedMockDataIfEmpty();
      const allWells = getAllWells();
      const well1 = allWells[0];
      const well2 = allWells[1];

      expect(() => {
        updateWell(well2.id, { name: well1.name });
      }).toThrow();
    });
  });

  describe('activateWell', () => {
    it('activates an inactive well', () => {
      seedMockDataIfEmpty();
      const allWells = getAllWells();
      const inactiveWell = allWells.find((w) => w.status === WELL_STATUS.INACTIVE);

      expect(inactiveWell).toBeDefined();

      const result = activateWell(inactiveWell.id);
      expect(result.updated).toBeDefined();
      expect(result.updated.status).toBe(WELL_STATUS.ACTIVE);

      const fetched = getWellById(inactiveWell.id);
      expect(fetched.status).toBe(WELL_STATUS.ACTIVE);
    });

    it('returns the well unchanged if already active', () => {
      seedMockDataIfEmpty();
      const allWells = getAllWells();
      const activeWell = allWells.find((w) => w.status === WELL_STATUS.ACTIVE);

      expect(activeWell).toBeDefined();

      const result = activateWell(activeWell.id);
      expect(result.updated).toBeDefined();
      expect(result.updated.status).toBe(WELL_STATUS.ACTIVE);
      expect(result.demoted).toBeUndefined();
    });

    it('enforces single active per rig by demoting the previous active well', () => {
      seedMockDataIfEmpty();
      const allWells = getAllWells();

      const activeOnRig = allWells.find(
        (w) => w.status === WELL_STATUS.ACTIVE && w.rig === 'CYC36'
      );
      const inactiveOnSameRig = allWells.find(
        (w) => w.status !== WELL_STATUS.ACTIVE && w.rig === 'CYC36'
      );

      expect(activeOnRig).toBeDefined();
      expect(inactiveOnSameRig).toBeDefined();

      const result = activateWell(inactiveOnSameRig.id);

      expect(result.updated).toBeDefined();
      expect(result.updated.status).toBe(WELL_STATUS.ACTIVE);
      expect(result.updated.id).toBe(inactiveOnSameRig.id);

      expect(result.demoted).toBeDefined();
      expect(result.demoted.status).toBe(WELL_STATUS.INACTIVE);
      expect(result.demoted.rig).toBe('CYC36');

      const fetchedDemoted = getWellById(result.demoted.id);
      expect(fetchedDemoted.status).toBe(WELL_STATUS.INACTIVE);

      const fetchedActivated = getWellById(inactiveOnSameRig.id);
      expect(fetchedActivated.status).toBe(WELL_STATUS.ACTIVE);
    });

    it('activates a well on a rig with no current active well without demoting', () => {
      localStorage.clear();
      const testWells = [
        {
          id: 'well-a',
          name: 'Well A',
          status: WELL_STATUS.INACTIVE,
          type: 'Horizontal',
          location: 'Test',
          owner: 'Owner',
          operator: 'Operator',
          contractor: 'Contractor',
          rig: 'SOLO-RIG',
          spudDate: '2024-01-01',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'well-b',
          name: 'Well B',
          status: WELL_STATUS.CREATED,
          type: 'Vertical',
          location: 'Test',
          owner: 'Owner',
          operator: 'Operator',
          contractor: 'Contractor',
          rig: 'SOLO-RIG',
          spudDate: '2024-02-01',
          createdAt: '2024-02-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(testWells));

      const result = activateWell('well-a');
      expect(result.updated.status).toBe(WELL_STATUS.ACTIVE);
      expect(result.demoted).toBeUndefined();
    });

    it('throws WellStorageError when well ID is not found', () => {
      seedMockDataIfEmpty();

      expect(() => {
        activateWell('non-existent-id');
      }).toThrow();
    });
  });

  describe('deleteWell', () => {
    it('deletes a well by ID', () => {
      seedMockDataIfEmpty();
      const allWells = getAllWells();
      const initialCount = allWells.length;
      const target = allWells[0];

      deleteWell(target.id);

      const afterDelete = getAllWells();
      expect(afterDelete.length).toBe(initialCount - 1);

      const found = getWellById(target.id);
      expect(found).toBeNull();
    });

    it('throws WellStorageError when well ID is not found', () => {
      seedMockDataIfEmpty();

      expect(() => {
        deleteWell('non-existent-id');
      }).toThrow();
    });
  });

  describe('resetToMockData', () => {
    it('resets localStorage to mock data', () => {
      seedMockDataIfEmpty();

      createWell({
        name: 'Extra Well',
        type: 'Horizontal',
        location: 'Test',
        owner: 'Owner',
        operator: 'Operator',
        contractor: 'Contractor',
        rig: 'EXTRA-01',
        spudDate: '2024-09-01',
      });

      expect(getAllWells().length).toBe(mockWells.length + 1);

      resetToMockData();

      expect(getAllWells().length).toBe(mockWells.length);
    });
  });

  describe('WellStorageError', () => {
    it('is an instance of Error', () => {
      const err = new WellStorageError('test error');
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('WellStorageError');
      expect(err.message).toBe('test error');
    });

    it('supports a cause parameter', () => {
      const cause = new Error('root cause');
      const err = new WellStorageError('wrapper', cause);
      expect(err.cause).toBe(cause);
    });
  });
});