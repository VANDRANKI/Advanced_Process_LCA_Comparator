import { useState, useEffect } from 'react'

const IMPACT_DB_KEY = 'impactDbV2'

const DEFAULT_IMPACT_DB = {
  electricity: [
    { name: 'Electricity, medium voltage (GLO)', GWP: 0.45, ADP: 0.12, WaterUse: 0.02, AP: 0.001, FETP: 0.0001 },
    { name: 'Electricity, medium voltage (US)', GWP: 0.38, ADP: 0.10, WaterUse: 0.015, AP: 0.0009, FETP: 0.00009 },
    { name: 'Electricity, medium voltage (EU)', GWP: 0.30, ADP: 0.09, WaterUse: 0.012, AP: 0.0007, FETP: 0.00008 },
  ],
  chemicals: [
    { name: 'Cerium carbonate (Ce2(CO3)3)', GWP: 4.5, ADP: 0.7, WaterUse: 2.1, AP: 0.03, FETP: 0.001 },
    { name: 'Cerium nitrate (Ce(NO3)3)', GWP: 6.5, ADP: 0.9, WaterUse: 2.6, AP: 0.04, FETP: 0.0012 },
    { name: 'Ammonium hydroxide (NH4OH)', GWP: 1.2, ADP: 0.2, WaterUse: 0.4, AP: 0.01, FETP: 0.0003 },
    { name: 'Nitric acid (HNO3)', GWP: 1.9, ADP: 0.25, WaterUse: 0.5, AP: 0.02, FETP: 0.0004 },
    { name: 'Ethanol', GWP: 1.7, ADP: 0.21, WaterUse: 1.1, AP: 0.015, FETP: 0.00035 },
    { name: 'Isopropanol (IPA)', GWP: 1.8, ADP: 0.22, WaterUse: 1.0, AP: 0.016, FETP: 0.00033 },
    { name: 'Acetone', GWP: 1.6, ADP: 0.2, WaterUse: 0.9, AP: 0.014, FETP: 0.00031 },
    { name: 'Polyethylene glycol (PEG)', GWP: 2.3, ADP: 0.3, WaterUse: 1.4, AP: 0.02, FETP: 0.0004 },
    { name: 'Polyvinylpyrrolidone (PVP)', GWP: 3.1, ADP: 0.4, WaterUse: 1.8, AP: 0.03, FETP: 0.0005 },
    { name: 'Sodium hydroxide (NaOH)', GWP: 2.1, ADP: 0.3, WaterUse: 0.8, AP: 0.02, FETP: 0.0004 },
    { name: 'Hydrochloric acid (HCl)', GWP: 1.5, ADP: 0.2, WaterUse: 0.7, AP: 0.015, FETP: 0.00035 },
    { name: 'Sulfuric acid (H2SO4)', GWP: 1.7, ADP: 0.22, WaterUse: 0.8, AP: 0.018, FETP: 0.00036 },
    { name: 'Ammonium nitrate', GWP: 2.2, ADP: 0.28, WaterUse: 0.9, AP: 0.022, FETP: 0.00042 },
    { name: 'Citric acid', GWP: 1.1, ADP: 0.15, WaterUse: 0.6, AP: 0.01, FETP: 0.00025 },
    { name: 'Urea', GWP: 1.3, ADP: 0.18, WaterUse: 0.7, AP: 0.012, FETP: 0.00027 },
    { name: 'Ammonia (NH3)', GWP: 2.8, ADP: 0.35, WaterUse: 1.0, AP: 0.03, FETP: 0.00045 },
    { name: 'Toluene', GWP: 2.0, ADP: 0.27, WaterUse: 1.2, AP: 0.02, FETP: 0.00038 },
    { name: 'Xylene', GWP: 2.1, ADP: 0.28, WaterUse: 1.2, AP: 0.021, FETP: 0.00039 },
    { name: 'Acetic acid', GWP: 1.4, ADP: 0.19, WaterUse: 0.8, AP: 0.013, FETP: 0.0003 },
    { name: 'Sodium chloride (NaCl)', GWP: 0.6, ADP: 0.08, WaterUse: 0.3, AP: 0.006, FETP: 0.0001 },
    { name: 'Aluminum nitrate', GWP: 3.2, ADP: 0.42, WaterUse: 1.5, AP: 0.032, FETP: 0.00052 },
    { name: 'Zirconium nitrate', GWP: 3.4, ADP: 0.44, WaterUse: 1.6, AP: 0.034, FETP: 0.00054 },
  ],
  waters: [
    { name: 'DI water', GWP: 0.0003, ADP: 0.00005, WaterUse: 1, AP: 0.00001, FETP: 0.000001 },
    { name: 'Ultra-pure water (UPW)', GWP: 0.001, ADP: 0.0001, WaterUse: 1, AP: 0.00002, FETP: 0.000002 },
    { name: 'Tap water', GWP: 0.0002, ADP: 0.00003, WaterUse: 1, AP: 0.000008, FETP: 0.000001 },
  ],
}

const normalizeImpactDb = (db) => {
  const toNum = (v) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  
  const norm = { electricity: [], chemicals: [], waters: [] }
  
  if (Array.isArray(db?.electricity)) {
    norm.electricity = db.electricity.map(e => ({
      name: e.name || '',
      GWP: toNum(e.GWP ?? e.co2ePerKWh),
      ADP: toNum(e.ADP),
      WaterUse: toNum(e.WaterUse),
      AP: toNum(e.AP),
      FETP: toNum(e.FETP),
    })).filter(x => x.name)
  }
  
  if (Array.isArray(db?.chemicals)) {
    norm.chemicals = db.chemicals.map(c => ({
      name: c.name || '',
      GWP: toNum(c.GWP ?? c.co2ePerKg),
      ADP: toNum(c.ADP),
      WaterUse: toNum(c.WaterUse),
      AP: toNum(c.AP),
      FETP: toNum(c.FETP),
    })).filter(x => x.name)
  }
  
  if (Array.isArray(db?.waters)) {
    norm.waters = db.waters.map(w => ({
      name: w.name || '',
      GWP: toNum(w.GWP ?? w.co2ePerL),
      ADP: toNum(w.ADP),
      WaterUse: toNum(w.WaterUse),
      AP: toNum(w.AP),
      FETP: toNum(w.FETP),
    })).filter(x => x.name)
  }
  
  // Fallback to defaults if any category is missing/empty
  if (!norm.electricity.length) norm.electricity = JSON.parse(JSON.stringify(DEFAULT_IMPACT_DB.electricity))
  if (!norm.chemicals.length) norm.chemicals = JSON.parse(JSON.stringify(DEFAULT_IMPACT_DB.chemicals))
  if (!norm.waters.length) norm.waters = JSON.parse(JSON.stringify(DEFAULT_IMPACT_DB.waters))
  
  return norm
}

const cloneDefaults = () => JSON.parse(JSON.stringify(DEFAULT_IMPACT_DB))

export const useImpactDatabase = () => {
  // Clone rather than seeding state with the module-level object itself.
  // DEFAULT_IMPACT_DB is the reset target, so if a consumer ever mutates the
  // state in place it would rewrite the defaults for the rest of the session
  // and resetImpactDb() would restore the corrupted values. The rest of this
  // file already deep-copies for the same reason.
  const [impactDb, setImpactDb] = useState(cloneDefaults)

  // Load saved impact database on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(IMPACT_DB_KEY)
      if (raw) {
        const saved = normalizeImpactDb(JSON.parse(raw))
        // Saved entries win by name, then any default not already present is
        // appended so a version that ships new reference data still surfaces it.
        //
        // Known limitation: this cannot tell "the user deleted this default"
        // from "this default is new since the last save", so a deleted default
        // reappears on reload. Nothing deletes entries today (updateImpactDb
        // and saveImpactDb are not wired to any UI yet), but whoever adds that
        // screen needs to persist the removed names alongside the database and
        // skip them here, otherwise deletions will not stick.
        const mergeByName = (primary, fallback) => {
          const seen = new Set()
          const result = []
          primary.forEach(it => { 
            if (it && it.name && !seen.has(it.name)) { 
              seen.add(it.name)
              result.push(it) 
            } 
          })
          fallback.forEach(it => { 
            if (it && it.name && !seen.has(it.name)) { 
              seen.add(it.name)
              result.push(it) 
            } 
          })
          return result
        }
        
        setImpactDb({
          electricity: mergeByName(saved.electricity || [], DEFAULT_IMPACT_DB.electricity),
          chemicals: mergeByName(saved.chemicals || [], DEFAULT_IMPACT_DB.chemicals),
          waters: mergeByName(saved.waters || [], DEFAULT_IMPACT_DB.waters),
        })
      }
    } catch (error) {
      console.error('Error loading impact database:', error)
      setImpactDb(cloneDefaults())
    }
  }, [])

  const updateImpactDb = (newDb) => {
    setImpactDb(newDb)
  }

  // localStorage throws rather than returning a status: QuotaExceededError when
  // the origin is full, and SecurityError when storage is blocked entirely, as
  // in Safari private browsing. The read above is already guarded; leaving the
  // writes bare would surface those as unhandled errors inside a click handler
  // and lose the in-memory state with it.
  const resetImpactDb = () => {
    try {
      localStorage.removeItem(IMPACT_DB_KEY)
    } catch (error) {
      console.error('Error clearing saved impact database:', error)
    }
    setImpactDb(cloneDefaults())
  }

  const saveImpactDb = () => {
    try {
      localStorage.setItem(IMPACT_DB_KEY, JSON.stringify(impactDb))
      return true
    } catch (error) {
      console.error('Error saving impact database:', error)
      return false
    }
  }

  return {
    impactDb,
    updateImpactDb,
    resetImpactDb,
    saveImpactDb
  }
}
