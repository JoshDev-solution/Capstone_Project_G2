const fs = require('fs');
const path = require('path');

const entities = [
  'activityLog',
  'auditLog',
  'chatbotLog',
  'message',
  'notification',
  'inventoryTransaction',
  'report'
];

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

for (const entity of entities) {
  const Entity = capitalize(entity);
  
  // Service
  const serviceContent = `import prisma from '../utils/prisma';

export class ${Entity}Service {
  async getAll() {
    return await prisma.${entity}.findMany();
  }

  async getById(id: number) {
    return await prisma.${entity}.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return await prisma.${entity}.create({
      data,
    });
  }

  async update(id: number, data: any) {
    return await prisma.${entity}.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.${entity}.delete({
      where: { id },
    });
  }
}

export const ${entity}Service = new ${Entity}Service();
`;

  // Controller
  const controllerContent = `import { Request, Response, NextFunction } from 'express';
import { ${entity}Service } from '../services/${entity}.service';

export class ${Entity}Controller {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await ${entity}Service.getAll();
      res.json(records);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const record = await ${entity}Service.getById(id);
      if (!record) {
        return res.status(404).json({ message: '${Entity} not found' });
      }
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await ${entity}Service.create(req.body);
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const record = await ${entity}Service.update(id, req.body);
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await ${entity}Service.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const ${entity}Controller = new ${Entity}Controller();
`;

  // Routes
  const routesContent = `import { Router } from 'express';
import { ${entity}Controller } from '../controllers/${entity}.controller';

const router = Router();

router.get('/', ${entity}Controller.getAll);
router.get('/:id', ${entity}Controller.getById);
router.post('/', ${entity}Controller.create);
router.put('/:id', ${entity}Controller.update);
router.delete('/:id', ${entity}Controller.delete);

export default router;
`;

  fs.writeFileSync(path.join(__dirname, 'services', `${entity}.service.ts`), serviceContent);
  fs.writeFileSync(path.join(__dirname, 'controllers', `${entity}.controller.ts`), controllerContent);
  fs.writeFileSync(path.join(__dirname, 'routes', `${entity}.routes.ts`), routesContent);
}

console.log('Successfully generated boilerplate for miscellaneous entities.');
