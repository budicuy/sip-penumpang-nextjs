"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Penumpang } from "@/types/penumpang";

const SEARCH_DEBOUNCE_MS = 500;

export const usePenumpang = () => {
    const [penumpang, setPenumpang] = useState<Penumpang[]>([]);
    const [totalData, setTotalData] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchPenumpang = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        const params = new URLSearchParams({
            page: String(currentPage),
            limit: String(itemsPerPage),
            search: debouncedSearchTerm,
            startDate: filterStartDate,
            endDate: filterEndDate,
        });

        try {
            const timeoutId = setTimeout(() => {
                abortControllerRef.current?.abort();
            }, 10000);

            const response = await fetch(`/api/penumpang?${params.toString()}`, {
                signal: abortControllerRef.current.signal,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorMessage = 'Gagal memuat data';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
                } catch {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            if (result && typeof result === 'object' && 'data' in result && 'total' in result) {
                const { data = [], total = 0 } = result;
                if (Array.isArray(data)) {
                    setPenumpang(data);
                    setTotalData(typeof total === 'number' ? total : 0);
                } else {
                    setPenumpang([]);
                    setTotalData(0);
                    setError('Format data tidak valid dari server.');
                }
            } else {
                setPenumpang([]);
                setTotalData(0);
                setError('Format response tidak valid dari server.');
            }
        } catch (err: unknown) {
            if (err instanceof Error && err.name !== 'AbortError') {
                setError(err.message);
                setPenumpang([]);
                setTotalData(0);
            }
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, itemsPerPage, debouncedSearchTerm, filterStartDate, filterEndDate]);

    useEffect(() => {
        fetchPenumpang();
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchPenumpang]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const sanitizedSearchTerm = searchTerm.trim().replace(/[<>]/g, '');
            setDebouncedSearchTerm(sanitizedSearchTerm);
            setCurrentPage(1);
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterStartDate, filterEndDate, itemsPerPage]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(new Set(penumpang.map(p => p.id)));
        } else {
            setSelectedRows(new Set());
        }
    }, [penumpang]);

    const handleSelectRow = useCallback((id: string) => {
        setSelectedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);
    
    const handleResetFilters = useCallback(() => {
        setSearchTerm("");
        setDebouncedSearchTerm("");
        setFilterStartDate("");
        setFilterEndDate("");
        setCurrentPage(1);
        setError(null);
    }, []);

    return {
        penumpang,
        totalData,
        isLoading,
        
        selectedRows,
        searchTerm,
        filterStartDate,
        filterEndDate,
        currentPage,
        itemsPerPage,
        error,
        setPenumpang,
        setTotalData,
        setIsLoading,
        
        setSelectedRows,
        setSearchTerm,
        setFilterStartDate,
        setFilterEndDate,
        setCurrentPage,
        setItemsPerPage,
        setError,
        fetchPenumpang,
        handleSelectAll,
        handleSelectRow,
        handleResetFilters
    };
};
