# ==============================================================================
# ProGuard / R8 Optimization & Obfuscation Rules
# Application: Spiritual Guard AI Core
# Package Target: com.spiritualguard.aicore / Android Release Build
# ==============================================================================

# General Optimization Flags
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify
-verbose

# Keep SourceFile and Line Numbers for crash reporting (Firebase Crashlytics / Google Play Vitals)
-keepattributes SourceFile,LineNumberTable,*Annotation*,Signature,InnerClasses,EnclosingMethod

# ------------------------------------------------------------------------------
# Google Play Services & Google Tasks API Client Rules
# ------------------------------------------------------------------------------
-keep class com.google.android.gms.common.** { *; }
-keep interface com.google.android.gms.common.** { *; }
-keep class com.google.android.gms.tasks.** { *; }
-keep class com.google.api.services.tasks.** { *; }
-keep class com.google.api.client.** { *; }
-dontwarn com.google.android.gms.**
-dontwarn com.google.api.client.**

# ------------------------------------------------------------------------------
# Firebase Authentication & AppCheck Rules
# ------------------------------------------------------------------------------
-keep class com.google.firebase.auth.** { *; }
-keep class com.google.firebase.FirebaseApp { *; }
-keep class com.google.firebase.components.** { *; }
-keep class com.google.firebase.analytics.** { *; }
-dontwarn com.google.firebase.**

# ------------------------------------------------------------------------------
# Android WebKit & Progressive Web App (PWA) Bridge Rules
# ------------------------------------------------------------------------------
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class android.webkit.** { *; }

# ------------------------------------------------------------------------------
# JSON Serialization / Data Models
# ------------------------------------------------------------------------------
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep data model fields for reflection (e.g. Google Task, ArmorPiece, AiGuidance)
-keepclassmembers class com.spiritualguard.aicore.models.** {
    <fields>;
    <methods>;
}

# ------------------------------------------------------------------------------
# Kotlin Coroutines & Reflection
# ------------------------------------------------------------------------------
-keep class kotlinx.coroutines.** { *; }
-keep interface kotlinx.coroutines.** { *; }
-dontwarn kotlinx.coroutines.**

# ------------------------------------------------------------------------------
# Security & Crypto Protection
# ------------------------------------------------------------------------------
# Do not remove cryptographic security providers
-keep class javax.crypto.** { *; }
-keep class java.security.** { *; }

# Ensure no dead-code elimination removes security confirmation flows
-keepclassmembers class * {
    public boolean confirmDestructiveAction(...);
    public void executeWorkspaceOperation(...);
}
