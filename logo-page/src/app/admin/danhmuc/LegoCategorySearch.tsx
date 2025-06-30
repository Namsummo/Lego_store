"use client";

import React from "react";
import { Input } from "@/components/ui/input";

interface LegoCategorySearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

function LegoCategorySearch({
  searchTerm,
  setSearchTerm,
}: LegoCategorySearchProps) {
  return (
    <div className=" mb-6 w-full">
      <Input
        type="text"
        placeholder="Tìm kiếm tên danh mục "
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full sm:w-1/2 border-white"
      />
    </div>
  );
}

export default LegoCategorySearch;
