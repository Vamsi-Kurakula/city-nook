# 📱 Versioning System

## **Overview**

City Crawler uses a **semantic versioning system** with a specific format for build numbers across different platforms.

## **Version Format**

### **Semantic Version: `a.b.c`**
- **`a`** - Major version (breaking changes)
- **`b`** - Minor version (new features, backward compatible)
- **`c`** - Patch version (bug fixes, backward compatible)

### **Build Number: `abc`**
- **Combined format**: Takes the semantic version and removes dots
- **Example**: Version `1.2.0` becomes build number `120`
- **Purpose**: Provides a unique, incrementing number for app stores

## **Version Examples**

| Semantic Version | Build Number | Description |
|------------------|--------------|-------------|
| `1.0.0` | `100` | Initial release |
| `1.1.0` | `110` | Minor feature update |
| `1.1.9` | `119` | Patch updates |
| `1.2.0` | `120` | Minor feature update |
| `2.0.0` | `200` | Major breaking change |

## **Files to Update**

When updating versions, you must update **ALL** of these files to maintain consistency:

### **1. `package.json`**
```json
{
  "version": "1.2.0"
}
```

### **2. `app.config.js`**
```javascript
export default {
  expo: {
    version: "1.2.0",
    ios: {
      buildNumber: "120"
    },
    android: {
      versionCode: 120
    }
  }
};
```

### **3. `eas.json`** (if needed)
- Usually auto-managed by EAS
- May need manual updates for specific build configurations

## **Update Process**

### **Step 1: Determine New Version**
- **Patch**: Increment `c` (e.g., `1.1.9` → `1.1.10`)
- **Minor**: Increment `b`, reset `c` (e.g., `1.1.9` → `1.2.0`)
- **Major**: Increment `a`, reset `b` and `c` (e.g., `1.1.9` → `2.0.0`)

### **Step 2: Calculate Build Number**
- Remove dots from semantic version
- **Example**: `1.2.0` → `120`

### **Step 3: Update All Files**
1. Update `package.json` version
2. Update `app.config.js` version and build numbers
3. Verify `eas.json` if needed

### **Step 4: Commit Changes**
```bash
git add .
git commit -m "Bump version to 1.2.0 (120)"
git tag v1.2.0
```

## **Version Guidelines**

### **When to Increment Major (`a`)**
- Breaking API changes
- Major UI/UX redesigns
- Incompatible database schema changes
- Platform-specific breaking changes

### **When to Increment Minor (`b`)**
- New features added
- Significant improvements
- New crawl types or functionality
- Backward-compatible changes

### **When to Increment Patch (`c`)**
- Bug fixes
- Performance improvements
- Minor UI adjustments
- Documentation updates

## **Build Number Rules**

### **Always Increment**
- Build numbers should **never decrease**
- Each release must have a unique build number
- Follow the `abc` format strictly

### **Platform Consistency**
- **iOS**: `buildNumber` (string)
- **Android**: `versionCode` (integer)
- **Both must match** the calculated build number

## **Automation Script**

Consider creating a script to automate version updates:

```bash
#!/bin/bash
# update-version.sh
NEW_VERSION=$1
BUILD_NUMBER=$(echo $NEW_VERSION | sed 's/\.//g')

# Update package.json
sed -i "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" package.json

# Update app.config.js
sed -i "s/version: \".*\"/version: \"$NEW_VERSION\"/" app.config.js
sed -i "s/buildNumber: \".*\"/buildNumber: \"$BUILD_NUMBER\"/" app.config.js
sed -i "s/versionCode: [0-9]*/versionCode: $BUILD_NUMBER/" app.config.js

echo "Updated to version $NEW_VERSION (build $BUILD_NUMBER)"
```

## **Release Checklist**

- [ ] Update all version numbers
- [ ] Update build numbers
- [ ] Test build process
- [ ] Commit version changes
- [ ] Create git tag
- [ ] Build for both platforms
- [ ] Submit to app stores

## **Troubleshooting**

### **Common Issues**
1. **Mismatched versions**: Ensure all files have the same semantic version
2. **Invalid build numbers**: Build numbers must be integers (Android) or strings (iOS)
3. **Duplicate build numbers**: Each release needs a unique build number

### **Validation**
Before releasing, verify:
- `package.json` version matches `app.config.js` version
- iOS buildNumber matches Android versionCode
- Build numbers follow the `abc` format
- All changes are committed and tagged

---

**Last Updated**: Version 1.2.0 (120)
**Next Update**: Follow this guide for version 1.2.1 (121) or 1.3.0 (130) 