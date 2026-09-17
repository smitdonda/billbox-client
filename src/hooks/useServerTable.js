import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import axiosInstance, { errorMessage } from "../config/AxiosInstance";

const PAGE_SIZE = 8;
const EMPTY_META = { page: 1, limit: PAGE_SIZE, total: 0, pageCount: 1 };

// Loads one page of a list endpoint. Search, sort and paging are done
// by the API.
export default function useServerTable({
  url,
  initialSort = null,
  errorText = "Could not load the data",
}) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(EMPTY_META);
  const [loading, setLoading] = useState(true);

  // zero-based, the API page is page + 1
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(initialSort || { key: null, dir: "asc" });

  // debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(0);
  }, [search, pageSize]);

  // ignore responses from older requests
  const latest = useRef(0);

  const load = useCallback(async () => {
    const requestId = latest.current + 1;
    latest.current = requestId;

    try {
      setLoading(true);
      const res = await axiosInstance.get(url, {
        params: {
          page: page + 1,
          limit: pageSize,
          ...(search ? { search } : {}),
          ...(sort.key ? { sort: sort.key, dir: sort.dir } : {}),
        },
      });
      if (requestId !== latest.current) return;

      setRows(res.data?.data || []);
      setMeta(res.data?.meta || { ...EMPTY_META, limit: pageSize });
    } catch (error) {
      if (requestId !== latest.current) return;
      setRows([]);
      toast.error(errorMessage(error, errorText));
    } finally {
      if (requestId === latest.current) setLoading(false);
    }
  }, [url, page, pageSize, search, sort, errorText]);

  useEffect(() => {
    load();
  }, [load]);

  // go back a page if the current one is now past the end (e.g. after a delete)
  useEffect(() => {
    if (page > 0 && page > meta.pageCount - 1) setPage(meta.pageCount - 1);
  }, [meta.pageCount, page]);

  // props for <DataTable server={...}>
  const server = useMemo(
    () => ({
      total: meta.total,
      pageCount: meta.pageCount,
      page,
      pageSize,
      query,
      sort,
      onPageChange: setPage,
      onPageSizeChange: setPageSize,
      onQueryChange: setQuery,
      onSortChange: setSort,
    }),
    [meta.total, meta.pageCount, page, pageSize, query, sort]
  );

  return { rows, meta, loading, reload: load, server };
}
