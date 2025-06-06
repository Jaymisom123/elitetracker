import dayjs from 'dayjs';
import { Request, Response } from 'express';
import { z } from 'zod';

import { FocusTimeModel } from '../models/focus-time-model';
import { buildValidationErrorMessage } from '../utils/build-validation-error-message-util';

export class FocusTimeController {
  create = async (req: Request, res: Response) => {
    try {
      const schema = z
        .object({
          timeFrom: z.coerce.date(),
          timeTo: z.coerce.date(),
        })
        .parse(req.body);

      const focusTime = await FocusTimeModel.create({
        timeFrom: schema.timeFrom,
        timeTo: schema.timeTo,
      });

      const date = dayjs().toDate();
      console.log(focusTime, date);

      return res.status(201).json({
        success: true,
        data: focusTime,
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: buildValidationErrorMessage(error.issues),
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'Erro interno do servidor',
        });
      }
    }
  };
  metricsByMonth = async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        date: z.coerce.date(),
      });

      const validateData = schema.safeParse(req.query);

      if (!validateData.success) {
        return res.status(400).json({
          success: false,
          error: buildValidationErrorMessage(validateData.error.issues),
        });
      }

      const { date } = validateData.data;
      const startDate = dayjs(date).startOf('month').toDate();
      const endDate = dayjs(date).endOf('month').toDate();

      const focusTimeMetrics = await FocusTimeModel.aggregate()
        .match({
          timeFrom: { $gte: startDate, $lte: endDate },
        })
        .project({
          year: { $year: '$timeFrom' },
          month: { $month: '$timeFrom' },
          day: { $dayOfMonth: '$timeFrom' },
        })
        .group({
          _id: {
            year: '$year',
            month: '$month',
            day: '$day',
          },
          count: { $sum: 1 },
        })
        .sort({ _id: 1 });

      return res.status(200).json({
        success: true,
        data: focusTimeMetrics,
      });
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  };
}
