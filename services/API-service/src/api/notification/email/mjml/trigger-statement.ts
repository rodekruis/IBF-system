import { getSectionElement, getTextElement } from '../../helpers/mjml.helper';

export const getMjmlTriggerStatement = ({
  triggerStatement,
}: {
  triggerStatement: string;
}): object => {
  const textElement = getTextElement({
    content: `<strong>Trigger Statement</strong>: ${triggerStatement}`,
  });

  return getSectionElement({ childrenEls: [textElement] });
};
