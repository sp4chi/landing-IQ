import { Router } from 'express';
import { dbService } from '../src/db/index.js';

export const reportsRouter = Router();

// Middleware to ensure authentication
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  next();
}

// GET /api/reports - Get all reports for logged-in user
reportsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = (req.user as any).id;
    const userReports = await dbService.getReportsByUserId(userId);
    return res.json({ reports: userReports });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/:id - Get specific report by ID
reportsRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;
    const report = await dbService.getReportById(id, userId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    return res.json({ report });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/reports/:id - Delete specific report
reportsRouter.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;
    const deleted = await dbService.deleteReport(id, userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Report not found' });
    }
    return res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    next(err);
  }
});
