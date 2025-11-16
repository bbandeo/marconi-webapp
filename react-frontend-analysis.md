# React Frontend Analysis: PropertyCard Conditional Rendering for Terreno Properties

## Current Implementation Analysis

### Component Location
- **File**: `components/PropertyCard.tsx`
- **Lines of Interest**: 116-137 (characteristics section)

### Current Property Type System
The PropertyCard component handles 5 property types through a TypeScript interface:
```typescript
type: "house" | "apartment" | "commercial" | "terreno" | "local"
```

### Database Schema Analysis
From `lib/supabase.ts`, properties have the following relevant fields:
- `property_type`: string (stored as "terreno" in database)
- `bedrooms`: number | null
- `bathrooms`: number | null
- `area_m2`: number | null

### Current Characteristics Rendering Logic
The current implementation (lines 116-137) renders bedrooms and bathrooms for ALL property types:

```typescript
{(property.bedrooms || property.bathrooms || property.area_m2) && (
  <div className="flex items-center justify-center gap-6 text-premium-primary py-4">
    {property.bedrooms && (
      <div className="flex items-center gap-1">
        <Bed className="w-4 h-4 text-vibrant-orange" />
        <span className="text-sm font-medium">{property.bedrooms} dorm.</span>
      </div>
    )}
    {property.bathrooms && (
      <div className="flex items-center gap-1">
        <Bath className="w-4 h-4 text-vibrant-orange" />
        <span className="text-sm font-medium">{property.bathrooms} baños</span>
      </div>
    )}
    {property.area_m2 && (
      <div className="flex items-center gap-1">
        <Square className="w-4 h-4 text-vibrant-orange" />
        <span className="text-sm font-medium">{property.area_m2}m²</span>
      </div>
    )}
  </div>
)}
```

### Problem Identification
- **Issue**: Properties of type "terreno" (land) display bedrooms and bathrooms which are not applicable
- **Impact**: Misleading information for land listings
- **User Experience**: Confusing and unprofessional presentation

## Proposed Solution: Conditional Rendering for Terreno Properties

### 1. Type-Aware Characteristics Display

Create a helper function to determine which characteristics should be shown based on property type:

```typescript
const shouldShowBedrooms = (propertyType: string): boolean => {
  return propertyType !== "terreno"
}

const shouldShowBathrooms = (propertyType: string): boolean => {
  return propertyType !== "terreno"
}

const shouldShowArea = (propertyType: string): boolean => {
  return true // Area is relevant for all property types including terreno
}
```

### 2. Updated Characteristics Section Implementation

Replace lines 116-137 with the following improved implementation:

```typescript
{/* LINEAMIENTO 2: CARACTERÍSTICAS CONSOLIDADAS EN LÍNEA HORIZONTAL */}
{(() => {
  const showBedrooms = shouldShowBedrooms(property.type) && property.bedrooms
  const showBathrooms = shouldShowBathrooms(property.type) && property.bathrooms
  const showArea = shouldShowArea(property.type) && property.area_m2

  // Only render the section if at least one characteristic should be shown
  if (!showBedrooms && !showBathrooms && !showArea) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-6 text-premium-primary py-4">
      {showBedrooms && (
        <div className="flex items-center gap-1">
          <Bed className="w-4 h-4 text-vibrant-orange" />
          <span className="text-sm font-medium">{property.bedrooms} dorm.</span>
        </div>
      )}
      {showBathrooms && (
        <div className="flex items-center gap-1">
          <Bath className="w-4 h-4 text-vibrant-orange" />
          <span className="text-sm font-medium">{property.bathrooms} baños</span>
        </div>
      )}
      {showArea && (
        <div className="flex items-center gap-1">
          <Square className="w-4 h-4 text-vibrant-orange" />
          <span className="text-sm font-medium">{property.area_m2}m²</span>
        </div>
      )}
    </div>
  )
})()}
```

### 3. Alternative Simplified Implementation

For a more concise approach, directly inline the conditions:

```typescript
{/* LINEAMIENTO 2: CARACTERÍSTICAS CONSOLIDADAS EN LÍNEA HORIZONTAL */}
{((property.type !== "terreno" && (property.bedrooms || property.bathrooms)) || property.area_m2) && (
  <div className="flex items-center justify-center gap-6 text-premium-primary py-4">
    {property.type !== "terreno" && property.bedrooms && (
      <div className="flex items-center gap-1">
        <Bed className="w-4 h-4 text-vibrant-orange" />
        <span className="text-sm font-medium">{property.bedrooms} dorm.</span>
      </div>
    )}
    {property.type !== "terreno" && property.bathrooms && (
      <div className="flex items-center gap-1">
        <Bath className="w-4 h-4 text-vibrant-orange" />
        <span className="text-sm font-medium">{property.bathrooms} baños</span>
      </div>
    )}
    {property.area_m2 && (
      <div className="flex items-center gap-1">
        <Square className="w-4 h-4 text-vibrant-orange" />
        <span className="text-sm font-medium">{property.area_m2}m²</span>
      </div>
    )}
  </div>
)}
```

## Visual Consistency Considerations

### 1. Layout Stability
- **Challenge**: When bedrooms/bathrooms are hidden, the card layout might shift
- **Solution**: The `py-4` padding on the characteristics container maintains consistent spacing
- **Benefit**: Area (m²) remains visible for terreno properties, preventing empty space

### 2. Responsive Design Maintenance
- **Current**: `gap-6` provides consistent spacing between characteristics
- **Preserved**: The flexbox layout adapts automatically when fewer items are displayed
- **Mobile**: The responsive design remains intact as the flex container adjusts

### 3. Visual Balance
- **For terreno properties**: Only area will be displayed, centered due to `justify-center`
- **For other properties**: Full characteristics display (bedrooms, bathrooms, area)
- **Consistent**: The orange accent color and icon styling remain uniform

## Edge Cases and Data Validation

### 1. Null/Undefined Values
```typescript
// Current handling is already robust:
property.bedrooms && property.bathrooms // Only renders if truthy
```

### 2. Property Type Variations
- **Database stores**: "terreno" (lowercase)
- **Frontend expects**: "terreno" (matches database)
- **Mapping**: Consistent across the application

### 3. Future Property Types
The solution is extensible for future property types that might not have bedrooms/bathrooms:

```typescript
const PROPERTY_TYPES_WITHOUT_BEDROOMS = ["terreno", "commercial", "local"]

const shouldShowBedrooms = (propertyType: string): boolean => {
  return !PROPERTY_TYPES_WITHOUT_BEDROOMS.includes(propertyType)
}
```

## Testing Recommendations

### 1. Unit Testing
Create test cases for the PropertyCard component:

```typescript
describe('PropertyCard characteristics display', () => {
  it('should hide bedrooms and bathrooms for terreno properties', () => {
    const terrenoProperty = {
      type: 'terreno',
      bedrooms: 3,
      bathrooms: 2,
      area_m2: 1000
    }
    // Assert bedrooms and bathrooms are not rendered
    // Assert area is still rendered
  })

  it('should show all characteristics for house properties', () => {
    const houseProperty = {
      type: 'house',
      bedrooms: 3,
      bathrooms: 2,
      area_m2: 150
    }
    // Assert all characteristics are rendered
  })

  it('should handle null bedrooms/bathrooms gracefully', () => {
    const propertyWithNulls = {
      type: 'terreno',
      bedrooms: null,
      bathrooms: null,
      area_m2: 1000
    }
    // Assert no errors and area is rendered
  })
})
```

### 2. Visual Regression Testing
- Test property cards with different combinations of characteristics
- Verify layout stability across property types
- Check mobile responsiveness with hidden characteristics

### 3. Manual Testing Scenarios
1. **Terreno with only area**: Verify single characteristic centers properly
2. **Terreno with no characteristics**: Ensure section is hidden completely
3. **Mixed property types**: Test grid layout consistency
4. **Edge cases**: Properties with missing data

## Implementation Steps

1. **Backup**: Create a backup of the current PropertyCard.tsx
2. **Update logic**: Replace lines 116-137 with the proposed conditional rendering
3. **Test locally**: Verify with different property types
4. **Check responsive design**: Test on mobile and desktop viewports
5. **Validate data**: Ensure no runtime errors with various data combinations

## Performance Impact

- **Minimal overhead**: Simple boolean checks for property type
- **No re-renders**: Conditional rendering doesn't affect React's reconciliation
- **Maintained caching**: No impact on component memoization if implemented

## Accessibility Considerations

- **Screen readers**: Characteristics section remains properly structured
- **Semantic HTML**: Icons and text maintain proper associations
- **Keyboard navigation**: No impact on keyboard accessibility
- **ARIA attributes**: Existing accessibility features preserved

## Future Enhancements

1. **Configuration-driven**: Move property type rules to a configuration object
2. **Custom characteristics**: Allow different characteristics per property type
3. **Internationalization**: Prepare for multi-language support
4. **Analytics**: Track which characteristics are most viewed per property type

This solution provides a clean, maintainable approach to conditionally displaying property characteristics while preserving the existing design system and user experience.