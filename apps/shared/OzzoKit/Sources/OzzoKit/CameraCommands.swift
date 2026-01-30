import Foundation

public enum OzzoCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum OzzoCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum OzzoCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum OzzoCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct OzzoCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: OzzoCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: OzzoCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: OzzoCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: OzzoCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct OzzoCameraClipParams: Codable, Sendable, Equatable {
    public var facing: OzzoCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: OzzoCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: OzzoCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: OzzoCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
