"use client";

import type {
  BaseErrorResponse,
  BaseServiceResponse,
} from "@/interfaces/services/services.interface";
import { registerDRUSchema } from "@/lib/schemas/register-dru-form.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@shadcn/components/ui/button";
import { Card, CardContent } from "@shadcn/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import type { DRUTypeResponse } from "@/interfaces/dru/dru.interface";
import fetchService from "@/services/fetch.service";
import { toast } from "sonner";
import { defaultToastSettings } from "@/lib/utils/common-variables.util";
import postService from "@/services/post.service";
import {
  regions,
  getProvincesByRegion,
  getCityMunByProvince,
  getBarangayByMun,
} from "phil-reg-prov-mun-brgy";
import { Separator } from "@/shadcn/components/ui/separator";

type RegisterDRUSchema = z.infer<typeof registerDRUSchema>;

export default function AddDRU() {
  const [druTypes, setDruTypes] = useState<DRUTypeResponse>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCityMunicipality, setSelectedCityMunicipality] = useState("");
  const [, setSelectedBarangay] = useState("");

  const form = useForm<RegisterDRUSchema>({
    resolver: zodResolver(registerDRUSchema),
    defaultValues: {
      dru_name: "",
      addr_street: "",
      addr_barangay: "",
      addr_city: "",
      addr_province: "",
      region: "",
      email: "",
      contact_number: "",
      dru_type: "",
    },
  });

  // Filtering functions for dependent dropdowns
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

  // Modified handlers that update both local state AND form values
  const handleRegionChange = (value: string) => {
    const [regionName, regCode] = value.split("|");

    // Update local state for filtering
    setSelectedRegion(regCode);
    setSelectedProvince("");
    setSelectedCityMunicipality("");
    setSelectedBarangay("");

    // Update form values
    form.setValue("region", regionName);
    form.setValue("addr_province", "");
    form.setValue("addr_city", "");
    form.setValue("addr_barangay", "");

    // Trigger validation
    form.trigger("region");
  };

  const handleProvinceChange = (value: string) => {
    const [provinceName, provCode] = value.split("|");

    // Update local state for filtering
    setSelectedProvince(provCode);
    setSelectedCityMunicipality("");
    setSelectedBarangay("");

    // Update form values
    form.setValue("addr_province", provinceName);
    form.setValue("addr_city", "");
    form.setValue("addr_barangay", "");

    // Trigger validation
    form.trigger("addr_province");
  };

  const handleCityMunicipalityChange = (value: string) => {
    const [cityName, munCode] = value.split("|");

    // Update local state for filtering
    setSelectedCityMunicipality(munCode);
    setSelectedBarangay("");

    // Update form values
    form.setValue("addr_city", cityName);
    form.setValue("addr_barangay", "");

    // Trigger validation
    form.trigger("addr_city");
  };

  const handleBarangayChange = (value: string) => {
    // Update form value
    form.setValue("addr_barangay", value);
    setSelectedBarangay(value);

    // Trigger validation
    form.trigger("addr_barangay");
  };

  const fetchDRUTypes = async () => {
    try {
      const response: DRUTypeResponse = await fetchService.getDRUTypes();
      setDruTypes(response);
    } catch (error) {
      console.error("Failed to fetch DRU types:", error);
    }
  };

  useEffect(() => {
    fetchDRUTypes();
  }, []);

  const onSubmit = async (values: RegisterDRUSchema) => {
    const formData = {
      ...values,
      dru_type: Number.parseInt(values.dru_type, 10),
    };
    console.log(formData);

    setIsSubmitting(true);

    try {
      const response: BaseServiceResponse | BaseErrorResponse =
        await postService.registerDRU(formData);
      console.log(formData);
      if (response.success) {
        toast.success("DRU Registered", {
          description:
            "The Disease Reporting Unit has been successfully registered",
          duration: defaultToastSettings.duration,
          dismissible: defaultToastSettings.isDismissible,
        });

        // Reset form and state
        form.reset();
        setSelectedRegion("");
        setSelectedProvince("");
        setSelectedCityMunicipality("");
        setSelectedBarangay("");
      } else {
        if (typeof response.message === "string") {
          toast.warning("Failed to create account", {
            description: response.message,
            duration: defaultToastSettings.duration,
            dismissible: defaultToastSettings.isDismissible,
          });
        } else {
          Object.entries(response.message).forEach(([field, errors]) => {
            (errors as string[]).forEach((error: string) => {
              toast.warning("Failed to create account", {
                description: `${field}: ${error}`,
                duration: defaultToastSettings.duration,
                dismissible: defaultToastSettings.isDismissible,
              });
            });
          });
        }
      }
    } catch {
      toast.error("Failed to connect to the server", {
        description: "Please check your internet connection",
        duration: defaultToastSettings.duration,
        dismissible: defaultToastSettings.isDismissible,
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row justify-between gap-1">
        <div>
          <p className="text-2xl lg:text-4xl font-bold">
            Register Disease Reporting Unit
          </p>
          <p className="mt-1 lg:mt-2 text-sm lg:text-md text-gray-500">
            Add a new Disease Reporting Unit to the surveillance system.
          </p>
        </div>
      </div>
      <Separator className="mt-2" />
      <Card className="w-full mx-auto">
        <CardContent className="py-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="dru_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter DRU name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The official name of the Disease Reporting Unit.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address Fields - In specified order with Select components */}
              <div className="space-y-4">
                <h3 className="text-md font-medium">Address Information</h3>

                {/* Region and Province in one row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Region - Select */}
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <Select
                          onValueChange={handleRegionChange}
                          value={
                            field.value
                              ? `${field.value}|${selectedRegion}`
                              : ""
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regions.map((region) => (
                              <SelectItem
                                key={region.reg_code}
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

                  {/* Province - Select */}
                  <FormField
                    control={form.control}
                    name="addr_province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Province</FormLabel>
                        <Select
                          onValueChange={handleProvinceChange}
                          value={
                            field.value
                              ? `${field.value}|${selectedProvince}`
                              : ""
                          }
                          disabled={!selectedRegion}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Province" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredProvince().map((province) => (
                              <SelectItem
                                key={province.prov_code}
                                value={`${province.name}|${province.prov_code}`}
                              >
                                {province.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* City and Barangay in one row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* City/Municipality - Select */}
                  <FormField
                    control={form.control}
                    name="addr_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City/Municipality</FormLabel>
                        <Select
                          onValueChange={handleCityMunicipalityChange}
                          value={
                            field.value
                              ? `${field.value}|${selectedCityMunicipality}`
                              : ""
                          }
                          disabled={!selectedProvince}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select City/Municipality" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredCityMunicipalities().map((city) => (
                              <SelectItem
                                key={city.mun_code}
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

                  {/* Barangay - Select */}
                  <FormField
                    control={form.control}
                    name="addr_barangay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barangay</FormLabel>
                        <Select
                          onValueChange={handleBarangayChange}
                          value={field.value}
                          disabled={!selectedCityMunicipality}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Barangay" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredBarangays().map((barangay) => (
                              <SelectItem
                                key={barangay.name}
                                value={barangay.name}
                              >
                                {barangay.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Street Address in its own row */}
                <FormField
                  control={form.control}
                  name="addr_street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="House/Building No., Street Name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@health.gov"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+63 912 345 6789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dru_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DRU Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select DRU type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {druTypes?.data.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.dru_classification}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The category that best describes this reporting unit.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register DRU"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
