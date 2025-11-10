"use client";

import GuestHeader from "@/components/guest/GuestHeader";
import { signUpSchema } from "@/lib/signup/schema";
import { Button } from "@shadcn/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shadcn/components/ui/form";
import { Input } from "@shadcn/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shadcn/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { DRUHierarchy } from "@/interfaces/dru/dru-hierarchy.interface";
import fetchService from "@/services/fetch.service";
import Link from "next/link";
import postService from "@/services/post.service";
import {
  BaseErrorResponse,
  BaseServiceResponse,
} from "@/interfaces/services/services.interface";
import { toast } from "sonner";
import { defaultToastSettings } from "@/lib/utils/common-variables.util";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shadcn/components/ui/avatar";
import { ArrowLeft, ArrowRight, Upload, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shadcn/components/ui/tabs";

type SignUpFormValues = z.infer<typeof signUpSchema>;
type ImageType = "profile" | "id";

export default function SignUp() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [idImage, setIdImage] = useState<string | null>(null);
  const [idImageFile, setIdImageFile] = useState<File | null>(null);
  const [DRUData, setDRUData] = useState<DRUHierarchy | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedSu, setSelectedSu] = useState("");
  const [activeTab, setActiveTab] = useState("personal-info");

  const fetchDRUHierarchyData = async () => {
    try {
      const response: DRUHierarchy = await fetchService.getDRUHierarchy();
      setDRUData(response);
    } catch (error) {
      console.error("Failed to fetch DRU hierarchy:", error);
    }
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    imageType: ImageType
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please select an image smaller than 5MB",
          duration: defaultToastSettings.duration,
          dismissible: defaultToastSettings.isDismissible,
        });
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type", {
          description: "Please select a JPEG, PNG, GIF, or WebP image",
          duration: defaultToastSettings.duration,
          dismissible: defaultToastSettings.isDismissible,
        });
        return;
      }

      // Store the file for upload
      if (imageType === "profile") {
        setProfileImageFile(file);
      } else if (imageType === "id") {
        setIdImageFile(file);
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (imageType === "profile") {
          setProfileImage(e.target?.result as string);
        } else if (imageType === "id") {
          setIdImage(e.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleImageUpload(event, "profile");
  };

  const handleIdImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(event, "id");
  };

  useEffect(() => {
    fetchDRUHierarchyData();
  }, []);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      password_confirm: "",
      first_name: "",
      middle_name: "",
      last_name: "",
    },
  });

  const handleNext = async () => {
    const requiredFields = [
      "first_name",
      "last_name",
      "email",
      "sex",
      "password",
      "password_confirm",
      "region",
      "surveillance_unit",
      "dru",
    ] as const;

    const isFormValid = await form.trigger(requiredFields);

    if (isFormValid) {
      setActiveTab("verification");
    } else {
      toast.error("Please fill in all required fields", {
        description: "Make sure all required fields are completed",
        duration: defaultToastSettings.duration,
        dismissible: defaultToastSettings.isDismissible,
      });
    }
  };

  const handleBack = () => {
    setActiveTab("personal-info");
  };

  const resetForm = () => {
    form.reset();
    setProfileImage(null);
    setProfileImageFile(null);
    setIdImage(null);
    setIdImageFile(null);
    setSelectedRegion("");
    setSelectedSu("");
    setActiveTab("personal-info");
  };

  const onSubmit = async (values: SignUpFormValues) => {
    if (!profileImageFile || !idImageFile) {
      toast.error("Profile picture and ID are required", {
        description: "Please upload the pictures for verification",
        duration: defaultToastSettings.duration,
        dismissible: defaultToastSettings.isDismissible,
      });
      return;
    }

    const formData = {
      ...values,
      dru: parseInt(values.dru, 10),
      profile_image: profileImageFile,
      id_card_image: idImageFile,
    };

    console.log("Submitting form data:", formData);

    try {
      const response: BaseServiceResponse | BaseErrorResponse =
        await postService.signUpUser(formData);
      if (response.success) {
        toast.success("Account created successfully", {
          description: "Please wait for admin approval to access the system",
          duration: defaultToastSettings.duration,
          dismissible: defaultToastSettings.isDismissible,
        });
        // todo: find another ways to fully reset the form
        // todo: makes select value empty after reset
        // todo: must find way to reset select value
        resetForm();
      } else {
        console.log("Failed to create account:", response);
        if (typeof response.message === "string") {
          // Simple message (like general failure message)
          toast.warning("Failed to create account", {
            description: response.message,
            duration: defaultToastSettings.duration,
            dismissible: defaultToastSettings.isDismissible,
          });
        } else {
          Object.entries(response.message).forEach(([field, errors]) => {
            (errors as string[]).forEach((error: string) => {
              toast.error("Failed to create account", {
                description: `${field}: ${error}`,
                duration: defaultToastSettings.duration,
                dismissible: defaultToastSettings.isDismissible,
              });
            });
          });
        }
      }
    } catch (error) {
      toast.error("Failed to connect to server", {
        description: "Please check your internet connection",
        duration: defaultToastSettings.duration,
        dismissible: defaultToastSettings.isDismissible,
      });
      console.error("Failed to connect to server:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <GuestHeader />
      <div className="flex justify-center p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold">Sign Up</CardTitle>
            <CardDescription className="text-lg">
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="personal-info"
                  className="flex items-center gap-2"
                >
                  <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center">
                    1
                  </span>
                  Personal Information
                </TabsTrigger>
                <TabsTrigger
                  value="verification"
                  className="flex items-center gap-2"
                >
                  <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center">
                    2
                  </span>
                  Verification
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal-info" className="space-y-6 mt-6">
                <Form {...form}>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Middle Name */}
                      <FormField
                        control={form.control}
                        name="middle_name"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>
                              Middle Name{" "}
                              <span className="text-muted-foreground">
                                (Optional)
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="David"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Last Name */}
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Doe"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Sex */}
                      <FormField
                        control={form.control}
                        name="sex"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Sex</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="min-w-[8rem]">
                                <SelectItem value="M">Male</SelectItem>
                                <SelectItem value="F">Female</SelectItem>
                                <SelectItem value="N/A">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Email */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="john@example.com"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Region */}
                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Region</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedRegion(value);
                                // Reset dependent fields when region changes
                                form.setValue("surveillance_unit", "");
                                form.setValue("dru", "");
                                setSelectedSu("");
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select region" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="min-w-[8rem]">
                                {DRUData?.data.map((regionObj) => (
                                  <SelectItem
                                    key={regionObj.region_name}
                                    value={regionObj.region_name}
                                  >
                                    {regionObj.region_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Surveillance Unit */}
                      <FormField
                        control={form.control}
                        name="surveillance_unit"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Surveillance Unit</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedSu(value);
                                // Reset DRU when surveillance unit changes
                                form.setValue("dru", "");
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select surveillance unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="min-w-[8rem]">
                                {selectedRegion ? (
                                  DRUData?.data
                                    .find(
                                      (regionObj) =>
                                        regionObj.region_name === selectedRegion
                                    )
                                    ?.surveillance_units.map((su) => (
                                      <SelectItem
                                        key={su.su_name}
                                        value={su.su_name}
                                      >
                                        {su.su_name}
                                      </SelectItem>
                                    ))
                                ) : (
                                  <SelectItem disabled value="placeholder">
                                    Select region first
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* DRU */}
                      <FormField
                        control={form.control}
                        name="dru"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>DRU</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                // Store the id (as a string) in the form state.
                                field.onChange(value);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select DRU" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="min-w-[8rem]">
                                {selectedRegion && selectedSu ? (
                                  DRUData?.data
                                    .find(
                                      (regionObj) =>
                                        regionObj.region_name === selectedRegion
                                    )
                                    ?.surveillance_units.find(
                                      (su) => su.su_name === selectedSu
                                    )
                                    ?.drus.map((dru) => (
                                      <SelectItem
                                        key={dru.id}
                                        value={dru.id.toString()} // Value is the id as a string
                                      >
                                        {dru.dru_name} {/* Display the name */}
                                      </SelectItem>
                                    ))
                                ) : (
                                  <SelectItem disabled value="placeholder">
                                    {selectedRegion
                                      ? "Select unit first"
                                      : "Select region first"}
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Password */}
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormDescription>
                              Must be at least 8 characters long
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Confirm Password */}
                      <FormField
                        control={form.control}
                        name="password_confirm"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={handleNext}
                      className="w-full h-12 text-lg font-semibold"
                    >
                      Next
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="verification" className="space-y-6 mt-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      Verification Documents
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload your profile picture and ID for account
                      verification
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <Avatar className="w-32 h-32 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                          <AvatarImage src={profileImage || undefined} />
                          <AvatarFallback className="bg-gray-100">
                            <User className="w-12 h-12 text-gray-400" />
                          </AvatarFallback>
                        </Avatar>
                        <label
                          htmlFor="profile-upload"
                          className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-3 cursor-pointer hover:bg-primary/90 transition-colors"
                        >
                          <Upload className="w-5 h-5" />
                        </label>
                        <Input
                          id="profile-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="hidden"
                        />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">Profile Picture</p>
                        <p className="text-sm text-muted-foreground">
                          Clear photo of your face
                        </p>
                      </div>
                    </div>

                    {/* ID Upload */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <div className="w-50 h-32 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                          {idImage ? (
                            <img
                              src={idImage || "/placeholder.svg"}
                              alt="ID Document"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center">
                              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Upload ID</p>
                            </div>
                          )}
                        </div>
                        <label
                          htmlFor="id-upload"
                          className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-3 cursor-pointer hover:bg-primary/90 transition-colors"
                        >
                          <Upload className="w-5 h-5" />
                        </label>
                        <Input
                          id="id-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleIdImageChange}
                          className="hidden"
                        />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">ID</p>
                        <p className="text-sm text-muted-foreground">
                          Employee Identification Card
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1 h-12 text-lg"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={form.handleSubmit(onSubmit)}
                      className="flex-1 h-12 text-lg font-semibold"
                    >
                      Create Account
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="text-center">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
