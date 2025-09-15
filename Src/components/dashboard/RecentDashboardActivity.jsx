import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Receipt, CreditCard, Play, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const activityConfig = {
  payment: { icon: Receipt, color: 'text-green-300' },
  subscription: { icon: CreditCard, color: 'text-purple-300' },
  entertainment: { icon: Play, color: 'text-teal-300' },
};

export default function RecentDashboardActivity({ activities }) {
  return (
    <Card className="glass-panel lg:h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-white text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="lg:h-[250px] pr-3">
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`mt-1 ${activityConfig[activity.type].color}`}>
                    {React.createElement(activityConfig[activity.type].icon, { className: 'w-5 h-5' })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">
                      <span className="font-medium">{activity.title}</span>
                    </p>
                    <p className="text-white/80 text-sm">{activity.note}</p>
                    <p className="text-white/60 text-xs">{formatDistanceToNow(activity.date, { addSuffix: true })}</p>
                  </div>
                  {activity.note.includes('Completed') && (
                    <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 py-8 lg:py-0">
                No recent activity.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button asChild variant="link" className="text-white/70 hover:text-white p-0">
          <Link to="/billtransactions">View all activity &rarr;</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}