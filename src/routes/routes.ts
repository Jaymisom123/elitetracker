import { Request, Response, Router } from 'express';

import packageJson from '../../package.json';
import { AuthController } from '../controllers/auth.controller';
import { FocusTimeController } from '../controllers/focus-time.controller';
import { HabitsController } from '../controllers/habits.controller';
import authMiddleware from '../middlewares/auth.middleware';

export const routes = Router();

const habitsController = new HabitsController();
const focusTimeController = new FocusTimeController();
const authController = new AuthController();

routes.get('/', (req: Request, res: Response) => {
  const { name, description, version } = packageJson;

  res.status(200).json({
    name,
    description,
    version,
  });
});

routes.get('/auth', (req: Request, res: Response) => {
  authController.auth(req, res);
});

routes.get('/auth/callback', (req: Request, res: Response) => {
  authController.authCallback(req, res);
});

routes.use(authMiddleware);

routes.get('/habits', (req: Request, res: Response) => {
  habitsController.index(req, res);
});

routes.get('/habits/:id/metrics', (req: Request, res: Response) => {
  habitsController.metrics(req, res);
});

routes.post('/habits', (req: Request, res: Response) => {
  habitsController.create(req, res);
});

routes.delete('/habits/:id', (req: Request, res: Response) => {
  habitsController.delete(req, res);
});

routes.patch('/habits/:id/toggle', (req: Request, res: Response) => {
  habitsController.toggle(req, res);
});

routes.post('/focus-time', (req: Request, res: Response) => {
  focusTimeController.create(req, res);
});

routes.get('/focus-time/metrics/month', (req: Request, res: Response) => {
  focusTimeController.metricsByMonth(req, res);
});

routes.get('/focus-time', (req: Request, res: Response) => {
  focusTimeController.index(req, res);
});
