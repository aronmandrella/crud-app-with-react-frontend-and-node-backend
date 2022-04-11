export const flatAssignDefinedValues = <
  ITarget extends ISource,
  ISource extends Record<string, unknown>,
>(
  target: ITarget,
  source: ISource,
) => {
  for (const key in source) {
    const value = source[key];
    if (typeof value !== 'undefined') {
      (target as any)[key] = value;
    }
  }
};
