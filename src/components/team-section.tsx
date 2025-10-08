
import { Card, CardContent } from '@/components/ui/card';
import { teamMembers } from '@/lib/team-data';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const TeamSection = () => {
  return (
    <section className="w-full max-w-4xl mt-16 text-center">
      <h2 className="text-3xl font-bold font-headline text-foreground mb-8">
        Meet the Creators
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {teamMembers.map((member, index) => (
          <Card key={index} className="bg-card/80 backdrop-blur-sm border rounded-2xl overflow-hidden text-center shadow-lg transition-transform transform hover:-translate-y-2 hover:shadow-2xl">
            <CardContent className="p-6">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-accent">
                <AvatarImage src={member.imageUrl} alt={member.name} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold text-foreground">{member.name}</h3>
              <p className="text-sm text-accent">{member.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default TeamSection;
