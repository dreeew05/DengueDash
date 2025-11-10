import { ReportFormValues } from "@/lib/schemas/case-report-form.schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@shadcn/components/ui/form";
import { Input } from "@shadcn/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shadcn/components/ui/select";
import { useState } from "react";
import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import {
  regions,
  getProvincesByRegion,
  getCityMunByProvince,
  getBarangayByMun,
} from "phil-reg-prov-mun-brgy";

interface AddressSectionProps {
  form: UseFormReturn<ReportFormValues>;
}

export function AddressSection({ form }: AddressSectionProps) {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCityMunicipality, setSelectedCityMunicipality] = useState("");
  const [, setSelectedBarangay] = useState("");

  const filteredProvince = () => {
    if (!selectedRegion) {
      return [];
    }
    return getProvincesByRegion(selectedRegion);
  };
  const filteredCityMunicipalities = () => {
    if (!selectedProvince) {
      return [];
    }
    return getCityMunByProvince(selectedProvince);
  };
  const filteredBarangays = () => {
    if (!selectedCityMunicipality) {
      return [];
    }
    return getBarangayByMun(selectedCityMunicipality);
  };

  const handleRegionChange = (
    field: ControllerRenderProps<ReportFormValues, "addr_region">,
    fieldValue: string
  ) => {
    // Set the field value to the selected city/municipality
    field.onChange(fieldValue);
    // Extract the municipality code from the selected value
    const [, regCode] = fieldValue.split("|");
    setSelectedRegion(regCode);
    setSelectedProvince("");
    setSelectedCityMunicipality("");
    setSelectedBarangay("");
  };

  const handleProvinceChange = (
    field: ControllerRenderProps<ReportFormValues, "addr_province">,
    fieldValue: string
  ) => {
    field.onChange(fieldValue);
    const [, provCode] = fieldValue.split("|");
    setSelectedProvince(provCode);
    setSelectedCityMunicipality("");
    setSelectedBarangay("");
  };

  const handleCityMunicipalityChange = (
    field: ControllerRenderProps<ReportFormValues, "addr_city">,
    fieldValue: string
  ) => {
    field.onChange(fieldValue);
    const [, munCode] = fieldValue.split("|");
    setSelectedCityMunicipality(munCode);
    setSelectedBarangay("");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Address</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="addr_region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <Select
                onValueChange={(value: string) =>
                  handleRegionChange(field, value)
                }
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem
                      key={region.name}
                      value={`${region.name}|${region.reg_code}`}
                    >
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="addr_province"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province</FormLabel>
              <Select
                onValueChange={(value: string) =>
                  handleProvinceChange(field, value)
                }
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Province" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredProvince().map(
                    (province: { name: string; prov_code: string }) => (
                      <SelectItem
                        key={province.name}
                        value={`${province.name}|${province.prov_code}`}
                      >
                        {province.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="addr_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <Select
                onValueChange={(value: string) =>
                  handleCityMunicipalityChange(field, value)
                }
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select City/Municipality" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredCityMunicipalities().map((city) => (
                    <SelectItem
                      key={city.name}
                      value={`${city.name}|${city.mun_code}`}
                    >
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="addr_barangay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Barangay</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Barangay" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredBarangays().map((barangay) => (
                    <SelectItem key={barangay.name} value={barangay.name}>
                      {barangay.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="addr_street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="addr_house_no"
          render={({ field }) => (
            <FormItem>
              <FormLabel>House No.</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? null : Number(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
