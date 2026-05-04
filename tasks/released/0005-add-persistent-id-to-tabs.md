# 0005 - Add persistentId Feature to Tabs Component

## Status: Released

## Dependency

## References
- [Accordion persistentId implementation](../../src/components/Accordion.js)

## Current State
The Tabs component does not have a `persistentId` feature. The Accordion component has this feature which allows the component to persist the state of open/closed panels to localStorage using a unique identifier key. The Tabs component should have similar functionality to persist the currently active tab to localStorage.

## Aceptance Criteria
- The Tabs component should accept a `persistentId` property (string type, reflects to DOM as `persistent-id` attribute)
- When `persistentId` is set and the component updates, it should restore the active tab from localStorage using the key format `tabs-persistent-id-{persistentId}`
- When the active tab changes (via the `active` property), the new active tab state should be saved to localStorage
- The feature should only work when localStorage is available
- The restored state should properly update both the Tabs and TabContent elements' `active` properties
- When the active tab is restored from localStorage, the `tab` event should be fired with the restored tab name in the detail
- A `restored` event should be fired when the persistent state is successfully restored from localStorage

### In-Scope
- [src/components/Tabs.js](../../src/components/Tabs.js)
- [docs-src/components/tabs.page.html](../../docs-src/components/tabs.page.html) - documentation updates
- [llms.txt](../../llms.txt) - update Tabs entry with persistentId property
- [tests/components/tabs.test.js](../../tests/components/tabs.test.js) - add tests for persistentId feature

### Out of Scope
- Other components should not be modified
- Accordion component implementation should not be changed

## Task Details
1. Add `persistentId` property to Tabs.js static properties (String type, reflect true, attribute 'persistent-id')
2. Initialize `persistentId` to null in the constructor
3. Modify the `updated()` lifecycle method to restore active tab state from localStorage when `persistentId` is set
4. Modify the `updateActiveElements()` method to save the current active tab state to localStorage when `persistentId` is set
5. Update the component documentation with examples of using the persistentId feature
6. Update llms.txt with the new persistentId property for the Tabs component
7. Add unit tests to verify persistentId functionality (restore on init, save on tab change)

## Testing / Validation Plan
1. Verify that setting `persistent-id` attribute persists the active tab state to localStorage
2. Verify that reloading the page with a set `persistent-id` restores the previously active tab
3. Verify that changing the active tab updates localStorage with the new active tab name
4. Verify that the feature works correctly when localStorage is not available (no errors thrown)
5. Verify that multiple Tabs components with different `persistent-id` values maintain separate states
6. Test in the documentation page at http://localhost:8083/components/tabs.html

### Testing / Validation Results

#### LLM Validation Results

**persistentId Property Added**
✅ PASS - The `persistentId` property (String type, reflects to `persistent-id` attribute) has been successfully added to Tabs.js static properties.

**localStorage Key Format**
✅ PASS - The component uses the correct key format `tabs-persistent-id-{persistentId}` for storing state in localStorage.

**State Restoration on Init**
✅ PASS - When a component with a `persistent-id` is loaded, it correctly restores the previously active tab from localStorage. Verified by:
- Setting active tab to "settings"
- Confirming it's saved to localStorage as `tabs-persistent-id-tabsPersistentExample = "settings"`
- Reloading the page
- Verifying the active tab is restored to "settings"

**State Persistence on Change**
✅ PASS - When the active tab changes, the new state is immediately saved to localStorage. Verified by changing tabs and checking localStorage updates.

**tab Event Fires on Restoration**
✅ PASS - The `tab` event is dispatched when state is restored from localStorage, allowing consumers to react to restored state. (Note: Verified through code inspection; event listener testing would require interactive browser testing)

**restored Event Fires on Restoration**
✅ PASS - A new `restored` event is dispatched when persistent state is successfully restored from localStorage. (Note: Verified through code inspection)

**localStorage Unavailability Handling**
✅ PASS - Code includes null-safe checks for localStorage (`window?.localStorage`) to prevent errors when localStorage is unavailable.

**Multiple Components with Different IDs**
✅ PASS - The implementation supports multiple Tabs components with different `persistent-id` values maintaining separate states, as they use unique localStorage keys.

**Documentation Updates**
✅ PASS - Updated documentation includes:
- New "Persistent State" example section with code sample and live example
- persistentId property documented in Properties section
- Both `tab` and `restored` events documented in Events section
- Updated llms.txt with persistentId feature description

**Unit Tests**
✅ PASS - Added comprehensive test suite with 6 new test cases covering:
1. Saving active tab to localStorage
2. Restoring active tab from localStorage
3. Firing restored event when state is restored
4. Firing tab event when state is restored
5. Handling missing localStorage gracefully
6. Maintaining separate states for different persistent-id values

#### User Validation Results
I (Dustin Poissant) have validated that this works as described above.
