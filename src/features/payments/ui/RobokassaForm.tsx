import type { RobokassaParams } from '@/features/payments/api/createRobokassaInvoice';
import React, { useEffect, useRef } from 'react';

interface RobokassaFormProps {
  params: RobokassaParams;
}

const ROBOKASSA_URL = 'https://auth.robokassa.ru/Merchant/Index.aspx';

export const RobokassaForm: React.FC<RobokassaFormProps> = ({ params }) => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.submit();
    }
  }, []);

  return (
    <div style={{ display: 'none' }}>
      <form ref={formRef} action={ROBOKASSA_URL} method="POST">
        {Object.entries(params).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      </form>
    </div>
  );
};
