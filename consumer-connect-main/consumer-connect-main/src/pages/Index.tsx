import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { MonthFilter } from "@/components/MonthFilter";
import { ActionButtons } from "@/components/ActionButtons";
import { ConsumerTable } from "@/components/ConsumerTable";
import { ConsumerHistoryPanel } from "@/components/ConsumerHistoryPanel";
import { months, getConsumerHistory } from "@/data/mockConsumers";
import { Consumer } from "@/types/consumer";
import { exportToCSV } from "@/lib/exportData";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(null);
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsumers = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/bills");
        const data = await response.json();

        const mappedData: Consumer[] = data.map((b: any) => ({
          id: String(b.id || Math.random()),
          month: b.month_year ? new Date(b.month_year).toLocaleString('default', { month: 'long', year: 'numeric' }) : "Unknown",
          consumerName: b.customer_name || "N/A",
          consumerNo: b.consumer_number,
          capacityKW: b.capacity || 0,
          commissionDate: b.commission_date || "N/A",
          importUnits: b.import_units || 0,
          exportUnits: b.export_units || 0,
          totalGeneration: b.generation_units || 0,
          readingDate: b.reading_date || "N/A",
          amount: b.billing_amount || 0,
          previousUnit: b.previous_banked_units || 0,
        }));

        setConsumers(mappedData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch consumers:", error);
        toast({
          title: "Connection Error",
          description: "Could not connect to the backend server.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchConsumers();
  }, [toast]);

  const filteredConsumers = useMemo(() => {
    return consumers.filter((consumer) => {
      const matchesSearch =
        searchQuery === "" ||
        (consumer.consumerName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (consumer.consumerNo?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMonth =
        selectedMonth === "All Months" || consumer.month === selectedMonth;

      return matchesSearch && matchesMonth;
    });
  }, [searchQuery, selectedMonth, consumers]);

  const handleFilter = () => {
    toast({
      title: "Filters Applied",
      description: `Showing ${filteredConsumers.length} consumer records`,
    });
  };

  const handleExport = () => {
    if (filteredConsumers.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Please adjust your filters to include some data",
        variant: "destructive",
      });
      return;
    }

    exportToCSV(filteredConsumers, "solar_consumer_data");
    toast({
      title: "Export Successful",
      description: `${filteredConsumers.length} records exported to CSV`,
    });
  };

  const handleRowClick = (consumer: Consumer) => {
    setSelectedConsumer(consumer);
  };

  const consumerHistory = useMemo(() => {
    if (!selectedConsumer) return [];
    return consumers
      .filter((c) => c.consumerNo === selectedConsumer.consumerNo)
      .sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime());
  }, [selectedConsumer, consumers]);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />

      {/* Controls Bar */}
      <div className="px-6 py-4 bg-card border-b border-border">
        <div className="flex flex-wrap items-center gap-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <MonthFilter
            value={selectedMonth}
            onChange={setSelectedMonth}
            months={months}
          />
          <ActionButtons onFilter={handleFilter} onExport={handleExport} />
        </div>
      </div>

      {/* Results Info */}
      <div className="px-6 py-3 bg-secondary/50 border-b border-border">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filteredConsumers.length}
          </span>{" "}
          consumer records
          {selectedMonth !== "All Months" && (
            <span>
              {" "}
              for <span className="font-semibold text-primary">{selectedMonth}</span>
            </span>
          )}
          {searchQuery && (
            <span>
              {" "}
              matching "<span className="font-semibold">{searchQuery}</span>"
            </span>
          )}
        </p>
      </div>

      {/* Table Container */}
      <div className="p-6">
        <ConsumerTable
          consumers={filteredConsumers}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Consumer History Panel */}
      {selectedConsumer && (
        <ConsumerHistoryPanel
          consumer={selectedConsumer}
          history={consumerHistory}
          onClose={() => setSelectedConsumer(null)}
        />
      )}
    </div>
  );
};

export default Index;
