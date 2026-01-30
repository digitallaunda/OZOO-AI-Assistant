import Testing
@testable import Ozzo

@Suite(.serialized)
@MainActor
struct NodePairingApprovalPrompterTests {
    @Test func nodePairingApprovalPrompterExercises() async {
        await NodePairingApprovalPrompter.exerciseForTesting()
    }
}
