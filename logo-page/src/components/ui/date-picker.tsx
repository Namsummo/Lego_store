"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DatePickerProps {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    placeholder?: string;
    className?: string;
    format?: string;
}

export function DatePicker({
    value,
    onChange,
    placeholder = "Chọn ngày...",
    className,
    format: dateFormat = "dd/MM/yyyy",
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal bg-[#232b3b] text-white border border-[#2d3748] hover:bg-[#232b3b]/80",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, dateFormat) : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#232b3b] text-white border border-[#2d3748]">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={date => {
                        onChange?.(date);
                        setOpen(false);
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}