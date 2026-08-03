'use client';

import { createContext, useContext, type ReactNode } from 'react';

/**
 * Whether this academy still accepts new students. Read by every buy/enroll CTA
 * so a closed academy shows the reason instead of starting a checkout the server
 * would refuse. Access for students who already paid is unaffected.
 */
const EnrollmentClosedContext = createContext(false);

export function EnrollmentStatusProvider({
  closed,
  children
}: {
  closed: boolean;
  children: ReactNode;
}) {
  return (
    <EnrollmentClosedContext.Provider value={closed}>
      {children}
    </EnrollmentClosedContext.Provider>
  );
}

export function useEnrollmentClosed(): boolean {
  return useContext(EnrollmentClosedContext);
}
