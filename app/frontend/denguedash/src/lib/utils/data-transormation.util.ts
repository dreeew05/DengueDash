export const transformData = (
  data: any,
  labelKey: string,
  valueKey: string
) => {
  return data.map((item: { [key: string]: any }) => ({
    label: item[labelKey] as string,
    value: item[valueKey] as number,
  }));
};
