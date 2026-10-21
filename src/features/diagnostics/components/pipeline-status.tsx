import { formatSpan, formatUtc, formatWindow } from "@/features/runs/format";
import type {
  BackfillStatus,
  Diagnostics,
  PollerStatus,
  PollState,
  PollStatus,
} from "../model";

const stateLabel: Record<PollState, string> = {
  idle: "Up to date",
  reading: "Reading",
  retrying: "Retrying with a smaller window",
  catching_up: "Catching up",
  failing: "Failing",
};

const stateDot: Record<PollState, string> = {
  idle: "bg-[#198038]",
  reading: "bg-[#0f62fe]",
  retrying: "bg-[#b28600]",
  catching_up: "bg-[#0f62fe]",
  failing: "bg-[#da1e28]",
};

const sourceNames = {
  trigger: "TriggerApp",
  logbook: "Logbook",
  influx: "VF48 / InfluxDB",
} as const;

function secondsBetween(from: string, to: string): number {
  return (Date.parse(to) - Date.parse(from)) / 1000;
}

/** Latest sign of life from the poller process or any of its sources. */
function lastActivity(data: Diagnostics): string | null {
  const stamps = [
    data.poller?.updatedAt,
    ...Object.values(data.sources).map((source) => source.poll?.updatedAt),
  ].filter((stamp): stamp is string => Boolean(stamp));
  return stamps.length
    ? stamps.reduce((a, b) => (Date.parse(a) > Date.parse(b) ? a : b))
    : null;
}

function Dot({ className }: { className: string }) {
  return (
    <span
      className={`h-1.5 w-1.5 shrink-0 rounded-full ${className}`}
      aria-hidden="true"
    />
  );
}

function PollerSummary({ data }: { data: Diagnostics }) {
  const poller: PollerStatus | null = data.poller;
  const activity = lastActivity(data);
  if (!poller) {
    return (
      <p className="text-sm text-muted">
        No poller status has been recorded yet. Start{" "}
        <code>x17-registry poll</code> with the current version.
      </p>
    );
  }
  const silent = activity ? secondsBetween(activity, data.serverTime) : null;
  // A single Influx attempt can run for minutes without writing status.
  const staleAfter = Math.max(600, (poller.intervalSeconds ?? 30) * 6);
  const stopped = poller.state === "stopped";
  const stalled = !stopped && silent !== null && silent > staleAfter;
  const behind = poller.behind?.length
    ? ` · behind: ${poller.behind.join(", ")}`
    : "";
  return (
    <div className="space-y-1 text-sm">
      <p className="flex items-center gap-2 font-semibold text-ink">
        <Dot
          className={
            stopped || stalled
              ? "bg-[#da1e28]"
              : poller.state === "catching_up"
                ? "bg-[#0f62fe]"
                : "bg-[#198038]"
          }
        />
        {stopped
          ? `Poller stopped ${formatUtc(poller.stoppedAt ?? poller.updatedAt)}`
          : stalled
            ? `No poller activity for ${formatSpan(silent ?? 0)}`
            : poller.state === "catching_up"
              ? "Poller is catching up"
              : "Poller is running"}
      </p>
      <p className="text-muted">
        Started {formatUtc(poller.startedAt)}
        {poller.pid ? ` · pid ${poller.pid}` : ""} · last full cycle{" "}
        {formatUtc(poller.lastCycleAt ?? null)} · interval{" "}
        {poller.intervalSeconds ?? "?"} s{behind}
      </p>
      {stalled && (
        <p className="text-muted">
          The service may have crashed or be stuck in one long read. Check{" "}
          <code>journalctl -u x17-registry@poll</code>.
        </p>
      )}
    </div>
  );
}

function SourceRow({
  name,
  poll,
  serverTime,
  scannedThrough,
}: {
  name: string;
  poll: PollStatus | null | undefined;
  serverTime: string;
  scannedThrough?: string | null;
}) {
  if (!poll) {
    return (
      <div className="grid gap-3 py-4 text-sm sm:grid-cols-[170px_1fr]">
        <span className="font-semibold text-ink">{name}</span>
        <span className="text-muted">No status recorded yet.</span>
      </div>
    );
  }
  const working = poll.state === "reading" || poll.state === "retrying";
  const lag = scannedThrough
    ? secondsBetween(scannedThrough, serverTime)
    : null;
  return (
    <div className="grid gap-x-6 gap-y-1 py-4 text-sm sm:grid-cols-[170px_1fr]">
      <span className="font-semibold text-ink">{name}</span>
      <div className="space-y-1">
        <p className="flex items-center gap-2 text-ink">
          <Dot className={stateDot[poll.state]} />
          {stateLabel[poll.state]}
          {poll.state === "failing" && poll.consecutiveFailures
            ? ` · ${poll.consecutiveFailures} failed attempt${poll.consecutiveFailures === 1 ? "" : "s"} in a row`
            : ""}
          {working && poll.attemptStartedAt
            ? ` · attempt running ${formatSpan(secondsBetween(poll.attemptStartedAt, serverTime))}`
            : ""}
        </p>
        {working && poll.window && (
          <p className="text-muted">Window {formatWindow(poll.window)}</p>
        )}
        <p className="text-muted">
          Last success {formatUtc(poll.lastSuccessAt ?? null)}
          {poll.lastRecords !== undefined
            ? ` · ${poll.lastRecords.toLocaleString()} records`
            : ""}
          {poll.lastDurationSeconds !== undefined
            ? ` in ${poll.lastDurationSeconds} s`
            : ""}
          {" · "}last attempt {formatUtc(poll.lastAttemptAt ?? null)}
        </p>
        {lag !== null && lag > 120 && (
          <p className="text-muted">
            Stored data trails the present by {formatSpan(lag)} (scanned through{" "}
            {formatUtc(scannedThrough ?? null)}).
          </p>
        )}
        {poll.lastWindow && !working && (
          <p className="text-muted">
            Last window {formatWindow(poll.lastWindow)}
          </p>
        )}
        {poll.lastRetryReason && (poll.retries ?? 0) > 0 && (
          <p className="text-muted">
            Retried {poll.retries}× this attempt · {poll.lastRetryReason}
            {poll.failedWindow
              ? ` · failed on ${formatWindow(poll.failedWindow)}`
              : ""}
          </p>
        )}
        {poll.lastError && (
          <p className="break-words text-[#a2191f]">
            {formatUtc(poll.lastError.at)} · {poll.lastError.type}:{" "}
            {poll.lastError.message || "no message"}
          </p>
        )}
      </div>
    </div>
  );
}

function BackfillSummary({
  backfill,
  serverTime,
}: {
  backfill: BackfillStatus | null;
  serverTime: string;
}) {
  if (!backfill) {
    return (
      <p className="text-sm text-muted">
        No backfill has been run since status tracking began.
      </p>
    );
  }
  // A running backfill writes at least every few seconds.
  const silent = secondsBetween(backfill.updatedAt, serverTime);
  const died = backfill.state === "running" && silent > 120;
  const label = died
    ? `Stopped without finishing (no update for ${formatSpan(silent)})`
    : { running: "Running", completed: "Completed", failed: "Failed" }[
        backfill.state
      ];
  return (
    <div className="space-y-1 text-sm">
      <p className="flex items-center gap-2 font-semibold text-ink">
        <Dot
          className={
            died || backfill.state === "failed"
              ? "bg-[#da1e28]"
              : backfill.state === "running"
                ? "bg-[#0f62fe]"
                : "bg-[#198038]"
          }
        />
        {label}
        {backfill.percentScanned !== null
          ? ` · ${backfill.percentScanned}% of its range scanned`
          : ""}
      </p>
      <p className="text-muted">
        Started {formatUtc(backfill.startedAt)} ·{" "}
        {backfill.endedAt
          ? `ended ${formatUtc(backfill.endedAt)}`
          : `last update ${formatUtc(backfill.updatedAt)}`}
        {backfill.phase ? ` · ${backfill.phase.replaceAll("_", " ")}` : ""}
      </p>
      <p className="text-muted">
        Range {formatUtc(backfill.oldestNeeded)} → {formatUtc(backfill.newest)}{" "}
        · position {formatUtc(backfill.cursor)}
        {backfill.windowSeconds
          ? ` · window ${formatSpan(backfill.windowSeconds)}`
          : ""}
      </p>
      <p className="text-muted">
        {(backfill.recordsRead ?? 0).toLocaleString()} records read ·{" "}
        {(backfill.recordsSaved ?? 0).toLocaleString()} saved
      </p>
      {backfill.error && (
        <p className="break-words text-[#a2191f]">{backfill.error}</p>
      )}
    </div>
  );
}

export function PipelineStatus({ data }: { data: Diagnostics }) {
  return (
    <section className="mt-12" aria-labelledby="pipeline-title">
      <h2 id="pipeline-title" className="text-lg font-semibold text-ink">
        Polling status
      </h2>
      <div className="mt-4 border-t border-line pt-4">
        <PollerSummary data={data} />
      </div>
      <div className="mt-4 divide-y divide-line border-t border-b border-line">
        {(Object.keys(sourceNames) as (keyof typeof sourceNames)[]).map(
          (key) => (
            <SourceRow
              key={key}
              name={sourceNames[key]}
              poll={data.sources[key].poll}
              serverTime={data.serverTime}
              scannedThrough={
                key === "influx" ? data.sources[key].scannedThrough : undefined
              }
            />
          ),
        )}
      </div>

      <h3 className="mt-8 text-sm font-semibold text-ink">Backfill</h3>
      <div className="mt-3">
        <BackfillSummary
          backfill={data.backfill}
          serverTime={data.serverTime}
        />
      </div>

      <h3 className="mt-8 text-sm font-semibold text-ink">Checkpoints</h3>
      {data.checkpoints.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No checkpoints stored.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-line">
                <th className="py-2 pr-6 font-medium">Name</th>
                <th className="py-2 pr-6 font-medium">Position</th>
                <th className="py-2 font-medium">Last changed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.checkpoints.map((checkpoint) => (
                <tr key={checkpoint.name}>
                  <td className="py-2 pr-6 font-mono text-xs text-ink">
                    {checkpoint.name}
                  </td>
                  <td className="py-2 pr-6 text-muted">
                    {formatUtc(checkpoint.value)}
                  </td>
                  <td className="py-2 text-muted">
                    {formatUtc(checkpoint.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-muted">
        Change them on the registry host with <code>x17-registry status</code>,{" "}
        <code>reset-backfill</code>,{" "}
        <code>set-checkpoint &lt;name&gt; &lt;time|now&gt;</code> and{" "}
        <code>backfill-influx --since &lt;time&gt; [--restart]</code>.
      </p>
    </section>
  );
}
