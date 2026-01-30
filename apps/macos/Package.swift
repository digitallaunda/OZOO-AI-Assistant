// swift-tools-version: 6.2
// Package manifest for the Ozzo macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "Ozzo",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "OzzoIPC", targets: ["OzzoIPC"]),
        .library(name: "OzzoDiscovery", targets: ["OzzoDiscovery"]),
        .executable(name: "Ozzo", targets: ["Ozzo"]),
        .executable(name: "ozzo-mac", targets: ["OzzoMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.2.2"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.1.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.8.0"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.8.1"),
        .package(url: "https://github.com/steipete/Peekaboo.git", branch: "main"),
        .package(path: "../shared/OzzoKit"),
        .package(path: "../../Swabble"),
    ],
    targets: [
        .target(
            name: "OzzoIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "OzzoDiscovery",
            dependencies: [
                .product(name: "OzzoKit", package: "OzzoKit"),
            ],
            path: "Sources/OzzoDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "Ozzo",
            dependencies: [
                "OzzoIPC",
                "OzzoDiscovery",
                .product(name: "OzzoKit", package: "OzzoKit"),
                .product(name: "OzzoChatUI", package: "OzzoKit"),
                .product(name: "OzzoProtocol", package: "OzzoKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/Ozzo.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "OzzoMacCLI",
            dependencies: [
                "OzzoDiscovery",
                .product(name: "OzzoKit", package: "OzzoKit"),
                .product(name: "OzzoProtocol", package: "OzzoKit"),
            ],
            path: "Sources/OzzoMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "OzzoIPCTests",
            dependencies: [
                "OzzoIPC",
                "Ozzo",
                "OzzoDiscovery",
                .product(name: "OzzoProtocol", package: "OzzoKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
