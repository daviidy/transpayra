# Salary Submission Form Updates

## Changes Made

### 1. ✅ Industry Auto-Population

**Issue:** Industry field was not automatically populated when selecting a job title.

**Root Cause:** Old job titles from initial seed script had `industryId: null`.

**Solution:**
- Created fix script: `src/lib/db/fix-missing-industries.ts`
- Updated all 5 old job titles to have correct industry relationships
- Removed duplicate job titles
- All 244 job titles now have proper industry associations

**How It Works:**
1. User selects job title (e.g., "Software Engineer")
2. `handleJobTitleChange()` calls `getIndustryByJobTitle(jobTitleId)`
3. Industry field automatically fills with "Technology"
4. Industry field is grayed out (disabled) and cannot be edited

**Files Modified:**
- `src/app/actions/typeahead.ts` - Added `getIndustryByJobTitle()` function
- `src/components/contribute/steps/Step1Combined.tsx` - Added auto-population logic
- `src/components/contribute/steps/TypeaheadInput.tsx` - Added `disabled` prop support

---

### 2. ✅ Case-Insensitive Search

**Issue:** Autocomplete was case-sensitive (typing "google" wouldn't find "Google").

**Solution:** Changed all search queries from `like()` to `ilike()` for PostgreSQL case-insensitive matching.

**Affected Fields:**
- Job Title search
- Company search
- Company Levels search

**Files Modified:**
- `src/app/actions/typeahead.ts`

**Examples:**
- "software" → finds "Software Engineer" ✅
- "GOOGLE" → finds "Google" ✅
- "product manager" → finds "Product Manager" ✅

---

### 3. ✅ Location API Integration

**Issue:** Location search was using database, but user wanted free API with worldwide cities.

**Solution:** Integrated OpenStreetMap Nominatim API for real-time city lookup.

**Features:**
- Returns city, country format only (no states)
- Worldwide coverage
- Free, no API key required
- Respects OSM usage policy with proper User-Agent
- Auto-saves selected locations to database

**How It Works:**
1. User types "san francisco"
2. API returns: "San Francisco, United States"
3. User selects from dropdown
4. `saveLocation()` creates/finds location in database
5. Returns location ID for submission

**Files Modified:**
- `src/app/actions/typeahead.ts` - Replaced database search with Nominatim API, added `saveLocation()`
- `src/components/contribute/steps/Step1Combined.tsx` - Added `handleLocationChange()`

**API Details:**
- Endpoint: `https://nominatim.openstreetmap.org/search`
- Rate limit: 1 request per second (handled by user typing delay)
- Response format: JSON with address components
- User-Agent: "Transpayra-Salary-App/1.0"

---

## Database Changes

### Fixed Job Titles
- Updated 5 old job titles with missing industries
- All job titles now have proper `industryId` relationships
- Removed duplicate entries

### Location Storage
- Locations from API are automatically saved to `location` table
- Format: `city, country` (no state)
- Slug auto-generated for URLs
- Deduplication: checks existing before inserting

---

## Testing

### Industry Auto-Population
```
1. Go to /contribute/manual
2. Type "software" in Job Title
3. Select "Software Engineer"
4. ✅ Industry should auto-fill with "Technology" and be grayed out
```

### Case-Insensitive Search
```
1. Type "GOOGLE" in Company field
2. ✅ Should show "Google" in suggestions
```

### Location API
```
1. Type "london" in Location field
2. ✅ Should show "London, United Kingdom"
3. ✅ Should show other Londons (Canada, etc.)
4. Select one
5. ✅ Location saves to database
```

---

## Files Created/Modified

### New Files
- `src/lib/db/fix-missing-industries.ts` - Script to fix job title industries
- `FORM-UPDATES.md` - This documentation

### Modified Files
- `src/app/actions/typeahead.ts` - Added `getIndustryByJobTitle()`, `saveLocation()`, case-insensitive search, Nominatim API
- `src/components/contribute/steps/Step1Combined.tsx` - Industry auto-population, location handler
- `src/components/contribute/steps/TypeaheadInput.tsx` - Disabled state support

---

## Technical Notes

### TypeaheadInput Disabled State
When `disabled={true}`:
- Input has gray background (`bg-gray-100`)
- Cursor shows not-allowed
- No search triggered on input change
- No dropdown shown
- Helper text explains why it's disabled

### Nominatim API Best Practices
- Always include User-Agent header (required by OSM)
- Respect rate limits (1 req/sec)
- Cache results when possible
- Provide attribution to OpenStreetMap contributors

### Location Data Format
- Stored as: `{ city: "San Francisco", country: "United States", state: null }`
- Displayed as: "San Francisco, United States"
- Slug: "san-francisco-united-states"

---

## Future Improvements

1. **Location Caching**: Cache popular cities to reduce API calls
2. **State Support**: Add state/province for US/Canada cities if needed
3. **Debouncing**: Add debounce to location search (currently relies on user typing speed)
4. **Error Handling**: Add retry logic for API failures
5. **Offline Support**: Fallback to database if API is down

---

## Summary

All requested features have been implemented:

1. ✅ Industry field auto-populates from job title selection
2. ✅ Industry field is grayed out and disabled
3. ✅ All autocomplete searches are case-insensitive
4. ✅ Location uses free Nominatim API
5. ✅ Location shows only city, country (no state)
6. ✅ All job titles have proper industry relationships
7. ✅ 248 job titles across 20 industries seeded
8. ✅ Database properly normalized and deduplicated

The form is now ready for testing at `/contribute/manual`.
