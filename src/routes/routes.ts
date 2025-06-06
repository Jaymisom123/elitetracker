import { Request, Response, Router } from 'express';

import packageJson from '../../package.json';
import { FocusTimeController } from '../controllers/focus-time.controller';
import { HabitsController } from '../controllers/habits.controller';

export const routes = Router();

const habitsController = new HabitsController();
const focusTimeController = new FocusTimeController();

routes.get('/', (req: Request, res: Response) => {
  const { name, description, version } = packageJson;

  res.status(200).json({
    name,
    description,
    version,
  });
});

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
