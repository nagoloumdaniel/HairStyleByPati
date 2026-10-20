import { beforeEach, describe, expect, it, vi } from 'vitest';

/* Réordonnancement catalogue : la base est simulée, on vérifie les écritures émises. */
const mocks = vi.hoisted(() => {
  const update = vi.fn((args: unknown) => args);
  return {
    update,
    categoryFindMany: vi.fn(),
    imageFindMany: vi.fn(),
    questionFindMany: vi.fn(),
    transaction: vi.fn(async (ops: unknown[]) => ops),
  };
});

vi.mock('./db', () => ({
  db: {
    category: { findMany: mocks.categoryFindMany, update: mocks.update },
    serviceImage: { findMany: mocks.imageFindMany, update: mocks.update },
    questionDefinition: { findMany: mocks.questionFindMany, update: mocks.update },
    $transaction: mocks.transaction,
  },
}));

import {
  reorderCategories,
  reorderServiceImages,
  reorderServiceQuestions,
  setPrimaryServiceImage,
} from './catalogue-admin';

const ids = (...list: string[]) => list.map((id) => ({ id }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('reorderCategories', () => {
  it('écrit un ordre contigu 0..n-1 selon la position', async () => {
    mocks.categoryFindMany.mockResolvedValue(ids('a', 'b', 'c'));
    await reorderCategories(['c', 'a', 'b']);
    expect(mocks.update.mock.calls.map(([args]) => args)).toEqual([
      { where: { id: 'c' }, data: { order: 0 } },
      { where: { id: 'a' }, data: { order: 1 } },
      { where: { id: 'b' }, data: { order: 2 } },
    ]);
  });

  it('refuse une liste incomplète, inconnue ou avec doublon', async () => {
    mocks.categoryFindMany.mockResolvedValue(ids('a', 'b', 'c'));
    await expect(reorderCategories(['a', 'b'])).rejects.toMatchObject({ status: 409 });
    await expect(reorderCategories(['a', 'b', 'x'])).rejects.toMatchObject({ status: 409 });
    await expect(reorderCategories(['a', 'a', 'b'])).rejects.toMatchObject({ status: 409 });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});

describe('reorderServiceQuestions', () => {
  it('numérote dans la prestation et refuse une question étrangère', async () => {
    mocks.questionFindMany.mockResolvedValue(ids('q1', 'q2'));
    await reorderServiceQuestions('s1', ['q2', 'q1']);
    expect(mocks.update.mock.calls.map(([args]) => args)).toEqual([
      { where: { id: 'q2', serviceId: 's1' }, data: { order: 0 } },
      { where: { id: 'q1', serviceId: 's1' }, data: { order: 1 } },
    ]);
    await expect(reorderServiceQuestions('s1', ['q2', 'zz'])).rejects.toMatchObject({
      status: 409,
    });
  });
});

describe('photos : la première est la principale', () => {
  it('reorderServiceImages marque la première comme principale', async () => {
    mocks.imageFindMany.mockResolvedValue(ids('i1', 'i2', 'i3'));
    await reorderServiceImages('s1', ['i3', 'i1', 'i2']);
    expect(mocks.update.mock.calls.map(([args]) => args)).toEqual([
      { where: { id: 'i3' }, data: { order: 0, isPrimary: true } },
      { where: { id: 'i1' }, data: { order: 1, isPrimary: false } },
      { where: { id: 'i2' }, data: { order: 2, isPrimary: false } },
    ]);
  });

  it('setPrimaryServiceImage place la photo en tête, les autres gardent leur ordre', async () => {
    mocks.imageFindMany.mockResolvedValue(ids('i1', 'i2', 'i3'));
    await setPrimaryServiceImage('s1', 'i2');
    expect(mocks.update.mock.calls.map(([args]) => args)).toEqual([
      { where: { id: 'i2' }, data: { order: 0, isPrimary: true } },
      { where: { id: 'i1' }, data: { order: 1, isPrimary: false } },
      { where: { id: 'i3' }, data: { order: 2, isPrimary: false } },
    ]);
  });

  it('setPrimaryServiceImage refuse une photo d’une autre prestation', async () => {
    mocks.imageFindMany.mockResolvedValue(ids('i1'));
    await expect(setPrimaryServiceImage('s1', 'autre')).rejects.toMatchObject({ status: 404 });
  });
});
