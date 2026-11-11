// AI-assisted: see docs/AI_LOG.md #59
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isTechnicalInspectionRequired } from '../src/validation/isTechnicalInspectionRequired.js';

describe('isTechnicalInspectionRequired', () => {
  const today = new Date(2026, 9, 26, 12, 0, 0, 0);

  it('is false when less than 5 years', () => {
    assert.equal(
      isTechnicalInspectionRequired('2022-03-10', today),
      false
    );
  });

  it('is false one day before the deadline', () => {
    assert.equal(
      isTechnicalInspectionRequired('2021-10-27', today),
      false
    );
  });

  it('is true exactly at 5 years', () => {
    assert.equal(
      isTechnicalInspectionRequired('2021-10-26', today),
      true
    );
  });

  it('is true when more than 5 years', () => {
    assert.equal(
      isTechnicalInspectionRequired('2020-01-15', today),
      true
    );
  });
});
