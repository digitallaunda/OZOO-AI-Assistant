import Foundation

public enum OzzoChatTransportEvent: Sendable {
    case health(ok: Bool)
    case tick
    case chat(OzzoChatEventPayload)
    case agent(OzzoAgentEventPayload)
    case seqGap
}

public protocol OzzoChatTransport: Sendable {
    func requestHistory(sessionKey: String) async throws -> OzzoChatHistoryPayload
    func sendMessage(
        sessionKey: String,
        message: String,
        thinking: String,
        idempotencyKey: String,
        attachments: [OzzoChatAttachmentPayload]) async throws -> OzzoChatSendResponse

    func abortRun(sessionKey: String, runId: String) async throws
    func listSessions(limit: Int?) async throws -> OzzoChatSessionsListResponse

    func requestHealth(timeoutMs: Int) async throws -> Bool
    func events() -> AsyncStream<OzzoChatTransportEvent>

    func setActiveSessionKey(_ sessionKey: String) async throws
}

extension OzzoChatTransport {
    public func setActiveSessionKey(_: String) async throws {}

    public func abortRun(sessionKey _: String, runId _: String) async throws {
        throw NSError(
            domain: "OzzoChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "chat.abort not supported by this transport"])
    }

    public func listSessions(limit _: Int?) async throws -> OzzoChatSessionsListResponse {
        throw NSError(
            domain: "OzzoChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "sessions.list not supported by this transport"])
    }
}
