'use client';

import Link from 'next/link';
import { Button } from 'antd';

export default function Home() {
  return (
    <div className="container text-center mt-5">
      <h1 className="mb-4">Laundry Survey App</h1>
      <p className="mb-4">
        This application is for laundry survey data entry and analytics.
      </p>
      <div className="d-flex justify-content-center gap-3">
        <Link href="/data-entry">
          <Button type="primary" size="large">
            Data Entry
          </Button>
        </Link>
        <Button type="default" size="large">
          Dashboard
        </Button>
      </div>
    </div>
  );
}
