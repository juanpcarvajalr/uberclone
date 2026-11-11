// AI-assisted: see docs/AI_LOG.md #59
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateFare } from '../src/utils/calculateFare.js';

describe('calculateFare', () => {
  it('matches official economy example', () => {
    const result = calculateFare({
      distanceKm: 8.5,
      durationMin: 22,
      category: 'economy',
      tip: 0,
    });
    assert.equal(result.fare, 19200);
    assert.equal(result.commission, 3840);
    assert.equal(result.driverEarnings, 15360);
  });

  it('matches official xl example', () => {
    const result = calculateFare({
      distanceKm: 8.5,
      durationMin: 22,
      category: 'xl',
      tip: 0,
    });
    assert.equal(result.fare, 26900);
    assert.equal(result.commission, 5380);
    assert.equal(result.driverEarnings, 21520);
  });

  it('matches premium example', () => {
    const result = calculateFare({
      distanceKm: 8.5,
      durationMin: 22,
      category: 'premium',
      tip: 0,
    });
    assert.equal(result.fare, 34600);
    assert.equal(result.commission, 6920);
    assert.equal(result.driverEarnings, 27680);
  });

  it('applies minimum fare', () => {
    const result = calculateFare({
      distanceKm: 1,
      durationMin: 2,
      category: 'economy',
      tip: 0,
    });
    assert.equal(result.fare, 6000);
    assert.equal(result.commission, 1200);
    assert.equal(result.driverEarnings, 4800);
  });

  it('adds tip fully to driver earnings', () => {
    const result = calculateFare({
      distanceKm: 8.5,
      durationMin: 22,
      category: 'economy',
      tip: 2000,
    });
    assert.equal(result.fare, 19200);
    assert.equal(result.commission, 3840);
    assert.equal(result.driverEarnings, 17360);
  });
});
