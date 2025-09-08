
import React from 'react';
import { Card } from '../../components/ui';

export const ScheduleView = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold">스케줄 관리</h2>
        </div>
        <Card className="!p-0 !overflow-hidden">
             <div style={{ height: '70vh', minHeight: '600px' }}>
                <iframe
                    src="https://calendar.google.com/calendar/embed?src=ko.south_korea%23holiday%40group.v.calendar.google.com&ctz=Asia%2FSeoul"
                    style={{ border: 0, width: '100%', height: '100%' }}
                    title="Google Calendar"
                ></iframe>
            </div>
        </Card>
      </div>
    );
};
