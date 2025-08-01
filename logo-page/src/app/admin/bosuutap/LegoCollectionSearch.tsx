"use client";

import React from "react";
import { Input } from "@/components/ui/input";

interface Props {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

function LegoCollectionSearch({ searchTerm, setSearchTerm }: Props) {
  return (
    <Input
      type="text"
      placeholder="Tìm kiếm tên danh mục "
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full sm:w-2/5 border-white"
    />
  );
}

export default LegoCollectionSearch;
