import Foundation
import Testing
@testable import Ozzo

@Suite(.serialized)
struct OzzoConfigFileTests {
    @Test
    func configPathRespectsEnvOverride() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("ozzo-config-\(UUID().uuidString)")
            .appendingPathComponent("ozzo.json")
            .path

        await TestIsolation.withEnvValues(["OZZOBOT_CONFIG_PATH": override]) {
            #expect(OzzoConfigFile.url().path == override)
        }
    }

    @MainActor
    @Test
    func remoteGatewayPortParsesAndMatchesHost() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("ozzo-config-\(UUID().uuidString)")
            .appendingPathComponent("ozzo.json")
            .path

        await TestIsolation.withEnvValues(["OZZOBOT_CONFIG_PATH": override]) {
            OzzoConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "ws://gateway.ts.net:19999",
                    ],
                ],
            ])
            #expect(OzzoConfigFile.remoteGatewayPort() == 19999)
            #expect(OzzoConfigFile.remoteGatewayPort(matchingHost: "gateway.ts.net") == 19999)
            #expect(OzzoConfigFile.remoteGatewayPort(matchingHost: "gateway") == 19999)
            #expect(OzzoConfigFile.remoteGatewayPort(matchingHost: "other.ts.net") == nil)
        }
    }

    @MainActor
    @Test
    func setRemoteGatewayUrlPreservesScheme() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("ozzo-config-\(UUID().uuidString)")
            .appendingPathComponent("ozzo.json")
            .path

        await TestIsolation.withEnvValues(["OZZOBOT_CONFIG_PATH": override]) {
            OzzoConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "wss://old-host:111",
                    ],
                ],
            ])
            OzzoConfigFile.setRemoteGatewayUrl(host: "new-host", port: 2222)
            let root = OzzoConfigFile.loadDict()
            let url = ((root["gateway"] as? [String: Any])?["remote"] as? [String: Any])?["url"] as? String
            #expect(url == "wss://new-host:2222")
        }
    }

    @Test
    func stateDirOverrideSetsConfigPath() async {
        let dir = FileManager().temporaryDirectory
            .appendingPathComponent("ozzo-state-\(UUID().uuidString)", isDirectory: true)
            .path

        await TestIsolation.withEnvValues([
            "OZZOBOT_CONFIG_PATH": nil,
            "OZZOBOT_STATE_DIR": dir,
        ]) {
            #expect(OzzoConfigFile.stateDirURL().path == dir)
            #expect(OzzoConfigFile.url().path == "\(dir)/ozzo.json")
        }
    }
}
