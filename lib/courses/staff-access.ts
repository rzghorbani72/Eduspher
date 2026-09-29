type Viewer = { id: string; role: string } | null;

const MANAGER_ROLES = new Set(['MANAGER', 'ADMIN']);

/** Staff run the academy, so they never buy a seat in it. */
export const isAcademyStaff = (viewer: Viewer): boolean =>
  Boolean(viewer && (MANAGER_ROLES.has(viewer.role) || viewer.role === 'TEACHER'));

/**
 * May this staff member open a course or class without buying it?
 * A manager may open everything; a teacher only what they teach.
 * The backend re-checks every room and lesson.
 */
export const staffCanOpen = (viewer: Viewer, teacherProfileId: string | null | undefined) =>
  Boolean(
    viewer &&
    (MANAGER_ROLES.has(viewer.role) ||
      (viewer.role === 'TEACHER' && viewer.id === teacherProfileId)),
  );

export type ViewerRole = 'MANAGER' | 'TEACHER';

/** A manager who also authored the course is both, so both badges show. */
export const viewerRoles = (viewer: Viewer, teaches: boolean): ViewerRole[] => {
  if (!viewer) return [];
  const roles: ViewerRole[] = [];
  if (MANAGER_ROLES.has(viewer.role)) roles.push('MANAGER');
  if (viewer.role === 'TEACHER' || (teaches && isAcademyStaff(viewer))) roles.push('TEACHER');
  return roles;
};
