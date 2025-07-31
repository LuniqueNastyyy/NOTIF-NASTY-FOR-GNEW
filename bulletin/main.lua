----------------------------------------------------------------------------------------------------------------------------------------------------------------
-- Copyright © Mobius1 2021
-- ! Edit it if you want, but don't re-release this without my permission, and never claim it to be yours !

-- Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
-- to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
-- and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

-- The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    
-- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
-- FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
-- WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
----------------------------------------------------------------------------------------------------------------------------------------------------------------
local notifications = {}

function Send(message, timeout, position, progress, theme, title, subject, icon, banner)

        title = string.upper(title)
        subject = string.upper(subject)

        if message == nil then
            return PrintError("^1Notifications ERROR: ^7Notification message is nil")
        end

        if type(message) == "number" then
            message = tostring(message)
        end

        if title == nil then
            title = ""
            -- return PrintError("^1Notifications ERROR: ^7Notification title is nil")
        end
        
        if subject == nil then
            subject = ""
            -- return PrintError("^1Notifications ERROR: ^7Notification subject is nil")
        end    

        if banner then  
        if string.len(message) > 100 and (banner == "CHAR_ANO" or banner == "CHAR_TWITTER") then
            return
        end
            banner = Config.Pictures[banner]
        else
            banner = Config.Pictures["CHAR_ABIGAIL"]
        end

        if not tonumber(timeout) then
            timeout = Config.Timeout
        end
        
        if position == nil then
            position = Config.Position
        end
        
        if progress == nil then
            progress = false
        end  

        local id = nil
        local duplicateID = DuplicateCheck(message)

        if duplicateID then
            id = duplicateID
        else
            id = uuid(message)
            notifications[id] = message
        end

        AddNotification({
            duplicate   = duplicateID ~= false,
            id          = id,
            type        = "advanced",
            message     = message,
            title       = title,
            subject     = subject,
            icon        = Config.Icons[icon],
            banner      = banner,
            timeout     = timeout,
            position    = position,
            progress    = progress,
            theme       = theme,
        })
    -- end
end

function SendSuccess(message, timeout, position, progress)
    Send(message, timeout, position, progress, "success")
end

function SendInfo(message, timeout, position, progress)
    Send(message, timeout, position, progress, "info")
end

function SendWarning(message, timeout, position, progress)
    Send(message, timeout, position, progress, "warning")
end

function SendError(message, timeout, position, progress)
    Send(message, timeout, position, progress, "error")
end

function SendAdvanced(message, title, subject, banner, timeout, position, progress, theme, icon)

    -- if exports.zCore:IsAnyMenuOpenned() then
    --     Citizen.CreateThread(function()
    --         while exports.zCore:IsAnyMenuOpenned() do
    --             Citizen.Wait(100)
    --         end

    --         title = string.upper(title)
    --         subject = string.upper(subject)
        
    --         if message == nil then
    --             return PrintError("^1Notifications ERROR: ^7Notification message is nil")
    --         end
        
    --         if type(message) == "number" then
    --             message = tostring(message)
    --         end
        
    --         if title == nil then
    --             title = ""
    --             -- return PrintError("^1Notifications ERROR: ^7Notification title is nil")
    --         end
            
    --         if subject == nil then
    --             subject = ""
    --             -- return PrintError("^1Notifications ERROR: ^7Notification subject is nil")
    --         end
        
    --         if not tonumber(timeout) then
    --             timeout = Config.Timeout
    --         end
            
    --         if position == nil then
    --             position = Config.Position
    --         end
            
    --         if progress == nil then
    --             progress = false
    --         end  
        
    --         local id = nil
    --         local duplicateID = DuplicateCheck(message)
        
    --         if duplicateID then
    --             id = duplicateID
    --         else
    --             id = uuid(message)
    --             notifications[id] = message
    --         end
        
    --         AddNotification({
    --             duplicate   = duplicateID ~= false,
    --             id          = id,
    --             type        = "advanced",
    --             message     = message,
    --             title       = title,
    --             subject     = subject,
    --             icon        = Config.Icons[icon],
    --             banner      = Config.Pictures[banner],
    --             timeout     = timeout,
    --             position    = position,
    --             progress    = progress,
    --             theme       = theme,
    --         })
    --     end)
    -- else
        title = string.upper(title)
        subject = string.upper(subject)

        if message == nil then
            return PrintError("^1Notifications ERROR: ^7Notification message is nil")
        end

        if type(message) == "number" then
            message = tostring(message)
        end

        if title == nil then
            title = ""
            -- return PrintError("^1Notifications ERROR: ^7Notification title is nil")
        end
        
        if subject == nil then
            subject = ""
            -- return PrintError("^1Notifications ERROR: ^7Notification subject is nil")
        end

        if not tonumber(timeout) then
            timeout = Config.Timeout
        end
        
        if position == nil then
            position = Config.Position
        end
        
        if progress == nil then
            progress = false
        end  

        local id = nil
        local duplicateID = DuplicateCheck(message)

        if duplicateID then
            id = duplicateID
        else
            id = uuid(message)
            notifications[id] = message
        end

        AddNotification({
            duplicate   = duplicateID ~= false,
            id          = id,
            type        = "advanced",
            message     = message,
            title       = title,
            subject     = subject,
            icon        = Config.Icons[icon],
            banner      = Config.Pictures[banner],
            timeout     = timeout,
            position    = position,
            progress    = progress,
            theme       = theme,
        })
    -- end
end

function SavePosition(position)
    SetResourceKvp("notif_position", position)
    Config.Position = GetResourceKvpString("notif_position")
end

function AddNotification(data)
    data.config = Config
    SendNUIMessage(data)
end

function PrintError(message)
    local s = string.rep("=", string.len(message))
    print(s)
    print(message)
    print(s)  
end

function DuplicateCheck(message)
    for id, msg in pairs(notifications) do
        if msg == message then
            return id
        end
    end

    return false
end

function uuid(message)
    math.randomseed(GetGameTimer() + string.len(message))
    local template ='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    return string.gsub(template, '[xy]', function (c)
        local v = (c == 'x') and math.random(0, 0xf) or math.random(8, 0xb)
        return string.format('%x', v)
    end)
end

RegisterNetEvent("notifications:send")
AddEventHandler("notifications:send", Send)

RegisterNetEvent("notifications:sendAdvanced")
AddEventHandler("notifications:sendAdvanced", SendAdvanced)

RegisterNetEvent("notifications:sendSuccess")
AddEventHandler("notifications:sendSuccess", SendSuccess)

RegisterNetEvent("notifications:sendInfo")
AddEventHandler("notifications:sendInfo", SendInfo)

RegisterNetEvent("notifications:sendWarning")
AddEventHandler("notifications:sendWarning", SendWarning)

RegisterNetEvent("notifications:sendError")
AddEventHandler("notifications:sendError", SendError)

RegisterNetEvent("notifications:savePosition")
AddEventHandler("notifications:savePosition", SavePosition)

RegisterNUICallback("nui_removed", function(data, cb)
    notifications[data.id] = nil
    cb('ok')
end)