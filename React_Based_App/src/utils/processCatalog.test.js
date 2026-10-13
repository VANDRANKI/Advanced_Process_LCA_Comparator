import test from 'node:test'
import assert from 'node:assert/strict'
import { processCatalog } from './processCatalog.js'

const KJ_PER_KWH = 3600

test('ambient of 0 C is used as 0, not replaced by the 25 C default', () => {
  // Drying: heat 1 kg of water from ambient to 100 C, then evaporate it.
  const at = (ambientC) => processCatalog.Drying.energyKWh({
    temperatureC: 100,
    waterRemovedKg: 1,
    ambientC,
  })
  const expected = (ambient) => ((1 * 4.18 * (100 - ambient)) + 2257) / KJ_PER_KWH * 1.15
  assert.ok(Math.abs(at(0) - expected(0)) < 1e-12)
  assert.ok(Math.abs(at(25) - expected(25)) < 1e-12)
  assert.ok(at(0) > at(25))
})

test('missing, empty or non-numeric ambient falls back to 25 C', () => {
  const run = (ambientC) => processCatalog.Annealing.energyKWh({
    temperatureC: 600,
    durationH: 1,
    massKg: 1,
    ambientC,
  })
  const base = run(25)
  assert.equal(run(undefined), base)
  assert.equal(run(null), base)
  assert.equal(run(''), base)
  assert.equal(run('abc'), base)
})

test('ambient above the process temperature never gives negative energy', () => {
  const energy = processCatalog.Calcination.energyKWh({
    temperatureC: 20,
    durationH: 0,
    massKg: 1,
    ambientC: 40,
  })
  assert.equal(energy, 0)
})

test('every process returns a finite, non-negative energy from its own defaults', () => {
  for (const [name, spec] of Object.entries(processCatalog)) {
    const energy = spec.energyKWh({ ...spec.defaults, ambientC: 25 })
    assert.ok(Number.isFinite(energy) && energy >= 0, `${name} energy was ${energy}`)
  }
})

test('drying reports removed water as negative water use', () => {
  assert.equal(processCatalog.Drying.waterKg({ waterRemovedKg: 0.2 }), -0.2)
})
