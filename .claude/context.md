# Marconi Inmobiliaria - Development Context

## Business Context


**Company**: Marconi Inmobiliaria  
**Location**: Reconquista, Santa Fe, Argentina  
**Industry**: Real Estate  
**Target Market**: Residential and commercial properties in Reconquista area

### Business Goals
- Digitalize property listings and management
- Streamline lead capture and follow-up process
- Provide modern, mobile-friendly property search experience
- Reduce manual administrative work for agents

### Key Stakeholders
- **Floriana Marconi**: Owner/Principal Agent
- **Real Estate Agents**: Daily users of admin panel
- **Potential Buyers/Renters**: Public website users
- **Developer**: Maintenance and feature development

## Technical Context

### Current State
- **Phase**: MVP completed, ongoing feature development
- **Users**: Single agency with 2-3 agents
- **Properties**: ~50-100 active listings
- **Traffic**: Local market, moderate traffic volume

### Development Priorities
1. **Stability**: Ensure core features work reliably
2. **User Experience**: Smooth workflows for agents and customers
3. **Mobile Optimization**: Most users browse on mobile devices
4. **SEO**: Property listings need good search visibility
5. **Lead Management**: Efficient lead capture and follow-up

## Cultural & Language Context

### Language Requirements
- **Primary Language**: Spanish (Argentina)
- **Currency**: Argentine Peso (ARS)
- **Address Format**: Argentine addressing conventions
- **Date Format**: DD/MM/YYYY format preferred
- **Phone Format**: +54 9 area_code number

### Local Market Terms
- **Propiedades**: Properties
- **Inmuebles**: Real estate properties
- **Alquiler**: Rent/Rental
- **Venta**: Sale
- **Dormitorios**: Bedrooms
- **Baños**: Bathrooms
- **Cochera**: Garage/Parking
- **Patio**: Backyard/Patio
- **Barrio**: Neighborhood

### Common Property Features (Argentina)
- **Cochera**: Garage/covered parking
- **Parrilla**: BBQ grill area
- **Quincho**: Outdoor entertainment area
- **Lavadero**: Laundry room
- **Aire acondicionado**: Air conditioning
- **Calefacción**: Heating
- **Portón automático**: Automatic gate

## Development Guidelines

### Code Quality
- Follow established patterns in existing codebase
- Maintain consistency with current styling and naming
- Test changes thoroughly in development environment
- Consider mobile-first responsive design

### Feature Development
- Always consider Spanish language requirements
- Implement proper form validation with Spanish error messages
- Ensure new features work on mobile devices
- Consider SEO implications for public-facing features

### Data Handling
- Respect existing database schema
- Use proper validation for Argentine phone numbers and addresses
- Handle currency formatting for Argentine Peso
- Consider timezone (Argentina Standard Time - ART)

## Common Issues to Avoid

### Technical Pitfalls
- Don't break existing Supabase RLS policies
- Avoid hardcoding English text in components
- Don't forget to handle loading and error states
- Remember to update TypeScript interfaces when adding fields

### Business Logic Errors
- Don't assume US/European address formats
- Avoid using USD currency symbols or formatting
- Don't use English date formats (MM/DD/YYYY)
- Remember that phone numbers need country code +54

### UX Considerations
- Mobile users are primary audience
- Keep forms simple and fast to fill
- Provide clear feedback for all user actions
- Consider slow internet connections in Argentina
