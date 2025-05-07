import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'IsAfterStartDate', async: false })
export class IsAfterStartDate implements ValidatorConstraintInterface {
  validate(endDate: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const startDate = (args.object as any)[relatedPropertyName];
    return endDate > startDate;
  }

  defaultMessage(args: ValidationArguments) {
    return `endDate must be greater than startDate.`;
  }
}

export function isValidDayOfMonth(day: number): boolean {
  return day >= 1 && day <= 31;
}
