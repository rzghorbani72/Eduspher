import { ClipboardList } from "lucide-react";

import { AccountPageHeader } from "@/components/account/account-page-header";
import { DataList, type DataColumn } from "@/components/shared/data-list/data-list";
import { DataPanel } from "@/components/shared/data-list/data-panel";
import { StatusPill } from "@/components/account/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "@/components/ui/link";
import { getAssignments, getSubmissions } from "@/lib/api/account-server";
import type { AssignmentSummary } from "@/lib/api/account-types";
import { getAcademyBySlug } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { getAcademyContext } from "@/lib/store-context";
import { buildAcademyPath, formatDate } from "@/lib/utils";

export default async function AccountAssignmentsPage() {
  const academyContext = await getAcademyContext();
  const slugForPaths = academyContext.isSubdomain ? null : academyContext.slug;

  // Two calls total. The old tabbed view fanned these out once per enrollment,
  // which grew linearly with how many courses a student had.
  const [assignments, submissions, academy] = await Promise.all([
    getAssignments(),
    getSubmissions(),
    academyContext.slug ? getAcademyBySlug(academyContext.slug).catch(() => null) : null,
  ]);

  const language = getAcademyLanguage(academy?.language ?? null, academy?.country_code ?? null);
  const translate = (key: string) => t(key, language);

  const submissionByAssignment = new Map(
    submissions.map((submission) => [submission.assignment_id, submission]),
  );

  const statusOf = (assignment: AssignmentSummary) => {
    const submission = submissionByAssignment.get(assignment.id);
    if (!submission) return "notSubmitted";
    return submission.status === "GRADED" ? "graded" : "submitted";
  };

  const statusLabel: Record<string, string> = {
    notSubmitted: translate("account.notSubmitted"),
    submitted: translate("learning.submitted"),
    graded: translate("learning.graded"),
  };

  const href = (assignment: AssignmentSummary) =>
    buildAcademyPath(slugForPaths, `/account/assignments/${assignment.id}`);

  const columns: DataColumn<AssignmentSummary>[] = [
    {
      id: "title",
      header: translate("account.myWork"),
      cell: (assignment) => (
        <Link href={href(assignment)} className="font-medium hover:underline">
          {assignment.title}
        </Link>
      ),
    },
    {
      id: "course",
      header: translate("courses.title"),
      cell: (assignment) => assignment.Lesson?.Season?.Course?.title ?? "—",
    },
    {
      id: "due",
      header: translate("account.assignmentDue"),
      cell: (assignment) =>
        assignment.due_at ? formatDate(assignment.due_at, language) : translate("account.noDueDate"),
    },
    {
      id: "status",
      header: translate("account.transactionStatus"),
      align: "end",
      cell: (assignment) => (
        <StatusPill
          label={statusLabel[statusOf(assignment)]}
          tone={statusOf(assignment) === "graded" ? "success" : statusOf(assignment) === "submitted" ? "info" : "neutral"}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title={translate("account.myWork")}
        description={translate("account.assignmentsDescription")}
        icon={ClipboardList}
      />
      <DataPanel>
        <DataList
          items={assignments}
          columns={columns}
          rowKey={(assignment) => assignment.id}
          emptyState={<EmptyState title={translate("account.noWork")} />}
        />
      </DataPanel>
    </div>
  );
}
