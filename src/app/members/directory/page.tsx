import { getDirectoryMembers } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Building2, UserCircle } from "lucide-react";

export default async function MemberDirectoryPage() {
  const { members, error } = await getDirectoryMembers();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-gray-900">Member Directory</h1>
        <p className="text-muted-foreground mt-2">Connect with other officers and members of the NPHC of Solano County.</p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">Error loading directory: {error}</p>
          </CardContent>
        </Card>
      ) : members.length === 0 ? (
        <Card className="border-dashed shadow-none border-2">
          <CardContent className="pt-16 pb-16 text-center flex flex-col justify-center items-center">
            <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mb-4">
              <UserCircle className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Directory is empty</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              No members have been populated in the database.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {members.map((member) => (
            <Card key={member.id} className="overflow-hidden hover:shadow-md transition-all duration-300 border-gray-200">
              <CardHeader className="pb-4 items-center text-center bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
                <div className="w-20 h-20 mb-3 rounded-full shadow-sm flex items-center justify-center bg-violet-100 text-violet-700 overflow-hidden shrink-0 border border-violet-200 relative">
                  {member.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={member.avatarUrl} 
                      alt={member.displayName} 
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-2xl font-bold font-headline tracking-wide">
                      {member.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">{member.displayName}</CardTitle>
                <div className="mt-1.5">
                  <Badge variant="secondary" className="font-medium text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors border-none">
                    {member.role || 'Member'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="flex flex-col gap-3 text-sm text-gray-700">
                  {member.organization && (
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                      <div>
                        <span className="block font-medium text-gray-900 leading-tight">{member.organization}</span>
                        {member.chapter && <span className="text-xs text-gray-500 mt-0.5 block">{member.chapter}</span>}
                      </div>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                      <Mail className="w-4 h-4 text-violet-400 shrink-0" />
                      <a href={`mailto:${member.email}`} className="text-blue-600 hover:text-blue-800 hover:underline truncate font-medium transition-colors">
                        {member.email}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
