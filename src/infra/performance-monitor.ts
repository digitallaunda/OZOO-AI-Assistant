/**
 * Performance monitoring and metrics tracking
 * Added in Phase 2 for production observability
 */

import { createSubsystemLogger } from "../logging/subsystem.js";

const log = createSubsystemLogger("perf");

type PerformanceMetric = {
  operation: string;
  durationMs: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
};

type PerformanceStats = {
  count: number;
  totalMs: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  p95Ms?: number;
  p99Ms?: number;
};

const metrics: PerformanceMetric[] = [];
const MAX_METRICS_BUFFER = 10000;

/**
 * Track performance of an operation
 */
export async function trackPerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>,
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const durationMs = performance.now() - start;
    recordMetric({ operation, durationMs, timestamp: Date.now(), metadata });
    return result;
  } catch (error) {
    const durationMs = performance.now() - start;
    recordMetric({
      operation,
      durationMs,
      timestamp: Date.now(),
      metadata: { ...metadata, error: String(error) },
    });
    throw error;
  }
}

/**
 * Track synchronous operation performance
 */
export function trackPerformanceSync<T>(
  operation: string,
  fn: () => T,
  metadata?: Record<string, unknown>,
): T {
  const start = performance.now();
  try {
    const result = fn();
    const durationMs = performance.now() - start;
    recordMetric({ operation, durationMs, timestamp: Date.now(), metadata });
    return result;
  } catch (error) {
    const durationMs = performance.now() - start;
    recordMetric({
      operation,
      durationMs,
      timestamp: Date.now(),
      metadata: { ...metadata, error: String(error) },
    });
    throw error;
  }
}

function recordMetric(metric: PerformanceMetric): void {
  metrics.push(metric);

  // Trim buffer if it grows too large
  if (metrics.length > MAX_METRICS_BUFFER) {
    metrics.splice(0, metrics.length - MAX_METRICS_BUFFER);
  }

  // Log slow operations (>1 second)
  if (metric.durationMs > 1000) {
    log.warn(`Slow operation: ${metric.operation} took ${metric.durationMs.toFixed(2)}ms`, {
      metadata: metric.metadata,
    });
  }
}

/**
 * Get performance statistics for an operation
 */
export function getPerformanceStats(operation: string): PerformanceStats | null {
  const operationMetrics = metrics.filter((m) => m.operation === operation);
  if (operationMetrics.length === 0) return null;

  const durations = operationMetrics.map((m) => m.durationMs).sort((a, b) => a - b);
  const totalMs = durations.reduce((sum, d) => sum + d, 0);
  const count = durations.length;

  const p95Index = Math.floor(count * 0.95);
  const p99Index = Math.floor(count * 0.99);

  return {
    count,
    totalMs,
    avgMs: totalMs / count,
    minMs: durations[0] ?? 0,
    maxMs: durations[durations.length - 1] ?? 0,
    p95Ms: durations[p95Index],
    p99Ms: durations[p99Index],
  };
}

/**
 * Get all tracked operations
 */
export function getAllOperations(): string[] {
  const operations = new Set(metrics.map((m) => m.operation));
  return Array.from(operations).sort();
}

/**
 * Clear all metrics (useful for testing or memory management)
 */
export function clearMetrics(): void {
  metrics.length = 0;
}

/**
 * Get recent slow operations (>1s in last N metrics)
 */
export function getRecentSlowOperations(limit = 10): PerformanceMetric[] {
  return metrics
    .filter((m) => m.durationMs > 1000)
    .slice(-limit)
    .reverse();
}

/**
 * Export all metrics for analysis (useful for debugging)
 */
export function exportMetrics(): PerformanceMetric[] {
  return [...metrics];
}

/**
 * Log performance summary for all operations
 */
export function logPerformanceSummary(): void {
  const operations = getAllOperations();
  if (operations.length === 0) {
    log.info("No performance metrics recorded");
    return;
  }

  log.info(`Performance Summary (${metrics.length} total metrics):`);
  for (const operation of operations) {
    const stats = getPerformanceStats(operation);
    if (!stats) continue;
    log.info(
      `  ${operation}: avg=${stats.avgMs.toFixed(2)}ms, ` +
        `p95=${stats.p95Ms?.toFixed(2) ?? "N/A"}ms, ` +
        `count=${stats.count}`,
    );
  }
}
