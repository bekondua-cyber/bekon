import { teamMembers } from "@/data/team";

export default function AdminTimPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tim</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-xl p-4 border border-gray-200"
          >
            <div className="font-medium text-gray-900">{member.name}</div>
            <div className="text-sm text-gray-500">{member.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const metadata = { title: "Tim" };
