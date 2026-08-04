import { Router } from 'express';
import { buildPublicResourceRouter, buildAdminResourceRouter } from './resource.routes.js';
import { authRouter } from './auth.routes.js';
import { submissionsRouter } from './submissions.routes.js';
import { eventsPublicRouter, eventsAdminGalleryRouter } from './events.routes.js';
import { registrationsAdminRouter } from './registrations.routes.js';
import { portalRouter } from './portal.routes.js';
import {
  applicationsAdminRouter,
  documentsAdminRouter,
  appointmentsAdminRouter,
  clientsAdminRouter,
} from './admin-portal.routes.js';
import { leadsAdminRouter, leadTasksAdminRouter } from './admin-leads.routes.js';
import { cronRouter } from './cron.routes.js';
import { settingsPublicRouter, settingsAdminRouter } from './settings.routes.js';
import { mediaRouter } from './media.routes.js';
import { usersRouter } from './users.routes.js';
import { dashboardRouter } from './dashboard.routes.js';
import {
  inquiriesAdminRouter,
  quotesAdminRouter,
  newsletterAdminRouter,
  auditAdminRouter,
} from './admin-submissions.routes.js';

export const apiRouter = Router();

/* ------------------------------- Public -------------------------------- */
apiRouter.use('/auth', authRouter);
apiRouter.use('/cron', cronRouter); // Vercel Cron (reminders) — guarded by CRON_SECRET
apiRouter.use('/settings', settingsPublicRouter);
apiRouter.use('/events', eventsPublicRouter);
apiRouter.use('/portal', portalRouter); // client portal: auth + applications + documents
apiRouter.use('/', submissionsRouter); // /inquiries, /newsletter, /quote-requests
apiRouter.use('/', buildPublicResourceRouter()); // /services, /faqs, /partners, ...

/* -------------------------------- Admin -------------------------------- */
const admin = Router();
admin.use('/dashboard', dashboardRouter);
admin.use('/media', mediaRouter);
admin.use('/users', usersRouter);
admin.use('/settings', settingsAdminRouter);
admin.use('/inquiries', inquiriesAdminRouter);
admin.use('/quote-requests', quotesAdminRouter);
admin.use('/newsletter', newsletterAdminRouter);
admin.use('/audit-logs', auditAdminRouter);
admin.use('/events', eventsAdminGalleryRouter); // gallery + form-field sub-CRUD (specific paths first)
admin.use('/registrations', registrationsAdminRouter);
admin.use('/applications', applicationsAdminRouter);
admin.use('/client-documents', documentsAdminRouter);
admin.use('/appointments', appointmentsAdminRouter);
admin.use('/clients', clientsAdminRouter);
admin.use('/leads', leadsAdminRouter);
admin.use('/lead-tasks', leadTasksAdminRouter);
admin.use('/', buildAdminResourceRouter()); // generic CRUD incl. events base

apiRouter.use('/admin', admin);
