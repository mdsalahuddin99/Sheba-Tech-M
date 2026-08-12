"use client";

import { useState } from "react";
import { SystemUpdate } from "@prisma/client";
import { UpdateForm } from "@/components/UpdateForm";
import { Plus, Sparkles, Wrench, Bug } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/shared/lib/utils";
import { deleteSystemUpdate } from "@/server/actions/systemUpdates";

export function SystemUpdatesClient({ initialUpdates }: { initialUpdates: SystemUpdate[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this update?")) {
      await deleteSystemUpdate(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 relative min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#5B45FF] text-white rounded-lg p-6 mb-12 flex justify-between items-center shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight mb-1">System Updates & Changelog</h1>
          <p className="text-white/80 text-sm">See what's new, changed, and fixed in the system.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
          title="Add New Update"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

        <div className="space-y-12">
          {initialUpdates.map((update, index) => {
            const isExpanded = expandedId === update.id;
            // Alternating layout for desktop
            const isEven = index % 2 === 0;

            return (
              <div key={update.id} className="relative flex items-start md:justify-between group">
                {/* Timeline Icon */}
                <div className="absolute left-[39px] md:left-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white shadow-sm border-4 border-slate-50 -translate-x-1/2 z-10 mt-1">
                  <Sparkles className="h-3 w-3" />
                </div>

                {/* Card Container */}
                <div className={cn(
                  "w-full ml-[80px] md:ml-0 md:w-[calc(50%-40px)]",
                  !isEven ? "md:ml-auto" : ""
                )}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative">
                    <button 
                      onClick={() => handleDelete(update.id)}
                      className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-green-500">{update.version}</h2>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                        {format(new Date(update.date), "MMMM d, yyyy")}
                      </span>
                    </div>

                    <div className="space-y-6">
                      {/* Features */}
                      {update.features.length > 0 && (
                        <div>
                          <ul className="space-y-2 mt-4">
                            {update.features.map((item, i) => (
                              <li key={i} className="flex items-start text-sm text-gray-700">
                                <span className="mr-2 text-green-500 mt-0.5">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {initialUpdates.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No system updates have been published yet.
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <UpdateForm 
              onSuccess={() => setIsModalOpen(false)}
              onCancel={() => setIsModalOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
